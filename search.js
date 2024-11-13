async function searchCalories() {
    const ingredient = document.getElementById('ingredientInput').value.trim();
    const resultContainer = document.getElementById('resultsContainer');
    
    resultContainer.innerHTML = '';
  
    if (!ingredient) {
      resultContainer.innerHTML = `<p>Please enter an ingredient name.</p>`;
      return;
    }
  
    try {
      const response = await fetch(`/search-calories?ingredient=${ingredient}`);
      const data = await response.json();
  
      if (data.message) {
        resultContainer.innerHTML = `<p>${data.message}</p>`;
      } else {
        resultContainer.innerHTML = '<h3>Search Results:</h3>';
        data.forEach(item => {
          resultContainer.innerHTML += `<p><strong>${item.name}</strong>: ${item.calories} kcal per 100g</p>`;
        });
      }
    } catch (error) {
      resultContainer.innerHTML = `<p>Error retrieving data. Please try again later.</p>`;
    }
  }
  