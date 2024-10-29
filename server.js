const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();

// 设置 body-parser 以解析 URL 编码的表单数据
app.use(bodyParser.urlencoded({ extended: true }));

// 读取食材热量数据
let foodHeatData = {};
fs.createReadStream('recipe/FoodHeat.csv')
  .pipe(csv())
  .on('data', (row) => {
    const { food, heat } = row;
    foodHeatData[food] = parseFloat(heat);  // 将热量数据存入字典
  })
  .on('end', () => {
    console.log('FoodHeat.csv processed');
  });

// 读取餐点 CSV 文件
async function readRecipes(mealType) {
  const mealFolder = path.join(__dirname, 'recipe', mealType);
  const recipeFile = path.join(mealFolder, `${mealType}.csv`);
  const recipes = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(recipeFile)
      .pipe(csv())
      .on('data', (row) => {
        const { 'Recipe Name': name, 'Total Calories': calories } = row;
        console.log(`读取菜谱: ${name}, 热量: ${calories}`);  // 添加调试信息
        recipes.push({ name, calories: parseFloat(calories) });
      })
      .on('end', () => {
        console.log(`完成读取 ${mealType} 菜谱，共 ${recipes.length} 道菜`);  // 输出读取的总数
        resolve(recipes);
      })
      .on('error', reject);
  });
}

// 计算每道菜的总热量
async function calculateRecipeCalories(recipePath) {
  return new Promise((resolve, reject) => {
    let totalCalories = 0;
    fs.createReadStream(recipePath)
      .pipe(csv())
      .on('data', (row) => {
        const { ingredient, amount } = row;
        if (foodHeatData[ingredient]) {
          totalCalories += (parseFloat(amount) / 100) * foodHeatData[ingredient];
        }
      })
      .on('end', () => {
        resolve(totalCalories);
      })
      .on('error', reject);
  });
}


app.post('/submit-data', (req, res) => {
  const { age, weight, height, gender, activity, fitnessGoal } = req.body; // 确保这里正确解构

  // 添加调试信息，检查接收的参数
  console.log("Received fitness goal:", fitnessGoal);

  // 计算 TDEE
  const tdee = calculateTDEE(weight, height, age, gender, activity);

  // 根据健身目标调整建议摄取的营养素
  let adjustedCalories;
  if (fitnessGoal === 'loseWeight') {
    adjustedCalories = tdee * 0.8; // 减脂 80%
  } else if (fitnessGoal === 'gainMuscle') {
    adjustedCalories = tdee * 1.2; // 增肌 120%
  } else {
    adjustedCalories = tdee * 1.0; // 保持体型 100%
  }

  // 重定向到 recommend.html 并携带调整后的卡路里参数和健身目标
  res.redirect(`/recommend.html?tdee=${Math.round(adjustedCalories)}&fitnessGoal=${fitnessGoal}`);
});




async function getMealSuggestions(mealType, minCalories, maxCalories) {
  const mealFolder = path.join(__dirname, 'recipe', mealType);
  const recipeFile = path.join(mealFolder, `${mealType}.csv`);
  const recipes = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(recipeFile)
      .pipe(csv())
      .on('data', (row) => {
        const { 'Recipe Name': name, 'Total Calories': calories } = row;
        const recipeCalories = parseFloat(calories); // 转为数字
        console.log(`读取菜谱: ${name}, 热量: ${recipeCalories}`); // 输出菜名和热量
        console.log(`热量范围: ${minCalories} - ${maxCalories}`); // 输出热量范围

        // 检查菜品是否在热量范围内
        if (recipeCalories >= minCalories && recipeCalories <= maxCalories) {
          recipes.push({ name, calories: recipeCalories });
        } else {
          console.log(`${name} 不在范围内`); // 输出不在范围内的菜名
        }
      })
      .on('end', () => {
        console.log(`完成读取 ${mealType} 菜谱，共 ${recipes.length} 道菜`); // 输出读取的总数
        resolve(recipes);
      })
      .on('error', reject);
  });
}

async function generateDailyMealPlan(tdee) {
  const breakfastCaloriesMin = Math.round(tdee * 0.25);
  const breakfastCaloriesMax = Math.round(tdee * 0.30);
  
  const lunchCaloriesMin = Math.round(tdee * 0.35);
  const lunchCaloriesMax = Math.round(tdee * 0.40);
  
  const dinnerCaloriesMin = Math.round(tdee * 0.30);
  const dinnerCaloriesMax = Math.round(tdee * 0.40);

  const breakfast = await getMealSuggestions('breakfast', breakfastCaloriesMin, breakfastCaloriesMax);
  const lunch = await getMealSuggestions('lunch', lunchCaloriesMin, lunchCaloriesMax);
  const dinner = await getMealSuggestions('dinner', dinnerCaloriesMin, dinnerCaloriesMax);

  return { breakfast, lunch, dinner };
}

// 提供静态文件
app.use(express.static(path.join(__dirname)));

// 提交 TDEE 后生成推荐菜谱并渲染到 recommend.html 页面上
app.get('/recommend.html', async (req, res) => {
  const tdee = req.query.tdee;

  if (!tdee) {
    res.send('TDEE 参数缺失');
    return;
  }

  const mealPlan = await generateDailyMealPlan(tdee);

});

// 获取符合热量范围的菜谱
app.get('/get-recipes', async (req, res) => {
  const { mealType, minCalories, maxCalories } = req.query;

  // 获取符合热量范围的菜谱
  const recipes = await getMealSuggestions(mealType, minCalories, maxCalories);
  
  // 返回 JSON 格式的菜谱数据
  res.json(recipes);
});

// 启动服务器
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
