import os
import pandas as pd
import re

# 设置文件夹路径
folder_path = 'E:/WellFit/recipe/'
calories_file = os.path.join(folder_path, 'FoodHeat.csv')

# 读取食材热量数据
calories_data = pd.read_csv(calories_file, header=0, names=['食材', '能量kcal/100g'])
calories_dict = dict(zip(calories_data['食材'], calories_data['能量kcal/100g']))

# 遍历三个文件夹
for meal in ['breakfast', 'lunch', 'dinner']:
    meal_folder = os.path.join(folder_path, meal)

    # 初始化输出数据
    output_data = []

    # 遍历该文件夹下所有 CSV 文件
    for recipe_file in os.listdir(meal_folder):
        if meal in recipe_file:
            continue
        elif recipe_file.endswith('.csv'):
            recipe_name = recipe_file[:-4]
            recipe_data = pd.read_csv(os.path.join(meal_folder, recipe_file), header=0, names=['食材', '量'])

            # 检查并删除第0行（如果是表头）
            if recipe_data.iloc[0]['食材'] == '食材':
                recipe_data = recipe_data[1:].reset_index(drop=True)

            total_calories = 0

            # 处理量，仅保留纯数字部分
            recipe_data['量'] = recipe_data['量'].apply(lambda x: re.sub(r'\D', '', str(x)))
            recipe_data['量'] = pd.to_numeric(recipe_data['量'], errors='coerce').fillna(0)

            # 计算热量
            for _, row in recipe_data.iterrows():
                ingredient = row['食材']
                amount = row['量']
                if ingredient in calories_dict:
                    total_calories += (amount * calories_dict[ingredient] / 100)

            # 保存结果
            output_data.append([recipe_name, total_calories])

    # 创建输出 DataFrame
    output_df = pd.DataFrame(output_data, columns=['Recipe Name', 'Total Calories'])

    # 写入输出 CSV 文件到相应文件夹
    output_file_path = os.path.join(meal_folder, f'{meal}.csv')
    output_df.to_csv(output_file_path, index=False)

print("报告生成完毕！")
