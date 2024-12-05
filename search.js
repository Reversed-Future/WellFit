// 获取当前语言设置
function getLanguageFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('language') || 'en';
}

// 定义双语文本
const languageTexts = {
  en: {
    enterIngredient: "Please enter an ingredient name.",
    enterRecipe: "Please enter a recipe name or ingredient.",
    errorRetrieving: "Error retrieving data. Please try again later.",
    noResults: "No results found.",
    searchResults: "Search Results:"
  },
  zh: {
    enterIngredient: "请输入食材名称。",
    enterRecipe: "请输入菜谱名称或食材。",
    errorRetrieving: "获取数据出错，请稍后再试。",
    noResults: "未找到结果。",
    searchResults: "搜索结果："
  }
};

// 获取当前语言
const currentLanguage = getLanguageFromUrl();
const texts = languageTexts[currentLanguage];

async function searchCalories() {
  const ingredient = document.getElementById('ingredientInput').value.trim();
  const resultContainer = document.getElementById('resultsContainer');
  
  resultContainer.innerHTML = '';
  
  if (!ingredient) {
    resultContainer.innerHTML = `<p>${texts.enterIngredient}</p>`;
    return;
  }
  
  try {
    const response = await fetch(`/search-calories?ingredient=${ingredient}`);
    const data = await response.json();
  
    if (data.message) {
      resultContainer.innerHTML = `<p>${data.message}</p>`;
    } else {
      resultContainer.innerHTML = `<h3>${texts.searchResults}</h3>`;
      data.forEach(item => {
        resultContainer.innerHTML += `<p><strong>${item.name}</strong>: ${item.calories} kcal per 100g</p>`;
      });
    }
  } catch (error) {
    resultContainer.innerHTML = `<p>${texts.errorRetrieving}</p>`;
  }
}

async function searchRecipes() {
  const query = document.getElementById('recipeInput').value.trim();
  const resultContainer = document.getElementById('recipeResultsContainer');
  
  resultContainer.innerHTML = '';
  
  if (!query) {
    resultContainer.innerHTML = `<p>${texts.enterRecipe}</p>`;
    return;
  }
  
  try {
    const response = await fetch(`/search-recipes?query=${query}`);
    const data = await response.json();
  
    if (data.message) {
      resultContainer.innerHTML = `<p>${data.message}</p>`;
    } else {
      resultContainer.innerHTML = `<h3>${texts.searchResults}</h3>`;
      data.forEach(item => {
        resultContainer.innerHTML += `<p><strong>${item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1)}</strong> - ${item.recipeName}: ${item.calories} kcal</p>`;
      });
    }
  } catch (error) {
    resultContainer.innerHTML = `<p>${texts.errorRetrieving}</p>`;
  }
}
