// DOM elements
const capacityInput = document.getElementById('capacity');
const itemNameInput = document.getElementById('item-name');
const itemValueInput = document.getElementById('item-value');
const itemWeightInput = document.getElementById('item-weight');
const optimizationSelect = document.getElementById('optimization');
const resultOutput = document.getElementById('result');
const selectedItemsOutput = document.getElementById('selected-items');

// Array to store the items
const items = [];
let editIndex = -1;
let isEditMode = false; // Variable para rastrear si se está en modo de edición

function addItem() {
  let itemName = itemNameInput.value.trim();
  const itemValue = parseInt(itemValueInput.value);
  const itemWeight = parseInt(itemWeightInput.value);

  if (!itemName || isNaN(itemValue) || isNaN(itemWeight)) {
    alert('Por favor, ingresa un nombre, valor y peso válidos.');
    return;
  }

  const existingItem = items.find(item => item.name === itemName);
  if (existingItem) {
    alert('El objeto con el mismo nombre ya existe en la lista.');
    return;
  }

  if (editIndex >= 0) {
    items[editIndex] = { name: itemName, value: itemValue, weight: itemWeight };
    editIndex = -1;
    isEditMode = false;
  } else {
    items.push({ name: itemName, value: itemValue, weight: itemWeight });
  }

  itemNameInput.value = '';
  itemValueInput.value = '';
  itemWeightInput.value = '';

  showItems();

  // Mostrar el título con el número de objetos creados
  const objectsCreatedTitle = document.getElementById('objects-created-title');
  objectsCreatedTitle.textContent = `Objetos Creados: ${items.length}`;
}


function showItems() {
  selectedItemsOutput.innerHTML = '';

  items.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.innerHTML = `${item.name} (Peso: ${item.weight}, Valor: ${item.value})  `;

    const editButton = document.createElement('button');
    editButton.innerText = 'Editar';
    editButton.onclick = () => editItem(index);

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Eliminar';
    deleteButton.onclick = () => removeItem(index);

    itemElement.appendChild(editButton);
    itemElement.appendChild(deleteButton);
    selectedItemsOutput.appendChild(itemElement);
  });

  // Mostrar u ocultar los botones "Agregar" y "Actualizar" según el modo de edición
  const addButton = document.querySelector('button[onclick="addItem()"]');
  const updateButton = document.querySelector('button[onclick="updateItem()"]');
  addButton.style.display = isEditMode ? 'none' : 'inline-block';
  updateButton.style.display = isEditMode ? 'inline-block' : 'none';
}

function editItem(index) {
  const item = items[index];
  itemNameInput.value = item.name;
  itemValueInput.value = item.value;
  itemWeightInput.value = item.weight;
  editIndex = index;
  isEditMode = true; // Entrar en modo de edición al presionar el botón "Editar"
  showItems();
}

function removeItem(index) {
  items.splice(index, 1);
  showItems();
}

function updateItem() {
  const itemName = itemNameInput.value;
  const itemValue = parseInt(itemValueInput.value);
  const itemWeight = parseInt(itemWeightInput.value);

  if (!itemName || isNaN(itemValue) || isNaN(itemWeight)) {
    alert('Por favor, ingresa un nombre, valor y peso válidos.');
    return;
  }

  // Verificar si el nombre del objeto ya existe en algún otro objeto de la lista actual
  const existingItem = items.find((item, index) => index !== editIndex && item.name === itemName);
  if (existingItem) {
    alert('El objeto con el mismo nombre ya existe en la lista.');
    return;
  }

  if (editIndex >= 0) {
    items[editIndex] = { name: itemName, value: itemValue, weight: itemWeight };
    editIndex = -1;
  }

  itemNameInput.value = '';
  itemValueInput.value = '';
  itemWeightInput.value = '';
  // Agregar la etiqueta "Datos" antes de mostrar los objetos agregados
  selectedItemsOutput.innerHTML = '<h2>Datos</h2>';
  isEditMode = false; // Salir del modo de edición al presionar el botón "Actualizar" o "Cancelar"
  showItems();
}


function solve() {
  const capacity = parseInt(capacityInput.value);

  if (isNaN(capacity) || capacity <= 0) {
    alert('Por favor, ingresa un tamaño de mochila válido (entero positivo).');
    return;
  }

  const optimization = optimizationSelect.value;

  if (optimization === 'max') {
    const { value, selectedItems } = knapsackMaximize(items, capacity);
    displayResult(value, selectedItems);
  } else if (optimization === 'min') {
    const { value, selectedItems } = knapsackMinimize(items, capacity);
    displayResult(value, selectedItems);
  }
}

function knapsackMaximize(items, capacity) {
  const n = items.length;
  const dp = Array.from(Array(n + 1), () => Array(capacity + 1).fill(0));
  const selectedItems = [];

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      if (items[i - 1].weight <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - items[i - 1].weight] + items[i - 1].value);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  let i = n;
  let w = capacity;
  while (i > 0 && w > 0) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedItems.push(items[i - 1]);
      w -= items[i - 1].weight;
    }
    i--;
  }

  return { value: dp[n][capacity], selectedItems };
}

function knapsackMaximize(items, capacity) {
  const n = items.length;
  const dp = Array.from(Array(n + 1), () => Array(capacity + 1).fill(0));
  const selectedItems = [];

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      for (let q = 0; q <= Math.floor(w / items[i - 1].weight); q++) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - q * items[i - 1].weight] + q * items[i - 1].value
        );
      }
    }
  }

  let i = n;
  let w = capacity;
  while (i > 0 && w > 0) {
    for (let q = Math.floor(w / items[i - 1].weight); q > 0; q--) {
      if (dp[i][w] === dp[i - 1][w - q * items[i - 1].weight] + q * items[i - 1].value) {
        for (let j = 0; j < q; j++) {
          selectedItems.push(items[i - 1]);
        }
        w -= q * items[i - 1].weight;
        break;
      }
    }
    i--;
  }

  return { value: dp[n][capacity], selectedItems };
}

function knapsackMinimize(items, capacity) {
  const n = items.length;
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const dp = Array.from(Array(n + 1), () => Array(totalValue + 1).fill(Number.MAX_SAFE_INTEGER)); // Use a large value instead of 0 for initialization

  dp[0][0] = 0; // Base case

  for (let i = 1; i <= n; i++) {
    for (let v = 0; v <= totalValue; v++) {
      for (let q = 0; q * items[i - 1].value <= v; q++) {
        dp[i][v] = Math.min(dp[i][v], dp[i - 1][v - q * items[i - 1].value] + q * items[i - 1].weight);
      }
    }
  }

  let v = 0;
  while (dp[n][v] <= capacity) {
    v++;
  }

  const selectedItems = [];
  for (let i = n; i > 0 && v > 0; i--) {
    for (let q = 0; q * items[i - 1].value <= v; q++) {
      if (dp[i][v] === dp[i - 1][v - q * items[i - 1].value] + q * items[i - 1].weight) {
        for (let j = 0; j < q; j++) {
          selectedItems.push(items[i - 1]);
        }
        v -= q * items[i - 1].value;
        break;
      }
    }
  }

  return { value: dp[n][totalValue], selectedItems };
}



function displayResult(value, selectedItems, capacity) {
  const allItemsList = items.map(item => `<tr><td>${item.name}</td><td>${item.weight}</td><td>${item.value}</td></tr>`);
  const selectedItemsList = selectedItems.map(item => `<tr><td>${item.name}</td><td>${item.weight}</td><td>${item.value}</td></tr>`);
  const selectedWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);

  const allItemsTable = `
      <h2>Respuesta</h2>
      <p>Peso máximo: ${capacityInput.value}</p>
      <h2>Todos los Objetos:</h2>
      <table>
        <tr><th>Nombre</th><th>Peso</th><th>Valor</th></tr>
        ${allItemsList.join('')}
      </table>
    `;
  const selectedItemsTable = `
      <h2>Objetos seleccionados:</h2>
      <table>
        <tr><th>Nombre</th><th>Peso</th><th>Valor</th></tr>
        ${selectedItemsList.join('')}
      </table>
    `;
  const itemsInBackpackTable = selectedItems.length > 0 ? selectedItemsTable : '<h2>Respuesta - Ninguno</h2>';
  const additionalDataOutput = `
      <h2>Respuesta - Datos adicionales</h2>
      <p>Peso total en la mochila: ${selectedWeight}</p>
      <p>Valor total en la mochila: ${value}</p>
    `;

  document.getElementById('capacity-output').innerHTML = `${allItemsTable}`;
  document.getElementById('selected-items-output').innerHTML = `${itemsInBackpackTable}`;
  document.getElementById('total-weight-output').innerHTML = `${additionalDataOutput}`;
}
