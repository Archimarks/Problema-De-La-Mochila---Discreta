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

  // Creamos una matriz para rastrear si hemos seleccionado al menos un objeto de cada tipo
  const selectedOneOfEach = Array(n).fill(false);

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      for (let q = 0; q <= Math.floor(w / items[i - 1].weight); q++) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - q * items[i - 1].weight] + q * items[i - 1].value
        );

        // Si seleccionamos al menos un objeto de este tipo, marcamos la bandera como verdadera
        if (q > 0) {
          selectedOneOfEach[i - 1] = true;
        }
      }
    }
  }

  // Ahora, asegurémonos de seleccionar al menos un objeto de cada tipo
  for (let i = 0; i < n; i++) {
    if (selectedOneOfEach[i]) {
      selectedItems.push(items[i]);
      capacity -= items[i].weight;
    }
  }

  // Luego, continuamos seleccionando objetos duplicados (como antes)
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
  const dp = Array.from(Array(n + 1), () => Array(capacity + 1).fill(Number.MAX_SAFE_INTEGER));
  const selectedOneOfEach = Array(n).fill(false);

  for (let i = 0; i <= n; i++) {
    dp[i][0] = 0; // Inicializamos la primera columna de la matriz dp con 0.
  }

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; // Inicializar con el valor anterior

      for (let q = 1; q * items[i - 1].weight <= w; q++) {
        dp[i][w] = Math.min(dp[i][w], dp[i - 1][w - q * items[i - 1].weight] + q * items[i - 1].value);

        // Si seleccionamos al menos un objeto de este tipo, marcamos la bandera como verdadera
        if (q > 0) {
          selectedOneOfEach[i - 1] = true;
        }
      }
    }
  }

  // Ahora, asegurémonos de seleccionar al menos un objeto de cada tipo
  const selectedItems = [];
  for (let i = 0; i < n; i++) {
    if (selectedOneOfEach[i]) {
      selectedItems.push(items[i]);
      capacity -= items[i].weight;
    }
  }

  // Luego, continuamos seleccionando objetos duplicados (como antes)
  let i = n;
  let w = capacity;
  while (i > 0 && w > 0) {
    for (let q = 1; q * items[i - 1].weight <= w; q++) {
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
  const selectedItemsTable = selectedItems.length > 0 ? `
    <h2>Objetos seleccionados:</h2>
    <table>
      <tr><th>Nombre</th><th>Peso</th><th>Valor</th></tr>
      ${selectedItemsList.join('')}
    </table>
  ` : '<h2>Respuesta - Ninguno</h2>';
  
  const totalValue = selectedItems.reduce((sum, item) => sum + item.value, 0);
  const additionalDataOutput = `
    <h2>Respuesta - Datos adicionales</h2>
    <p>Peso total en la mochila: ${selectedWeight}</p>
    <p>Valor total en la mochila: ${totalValue}</p>
  `;

  document.getElementById('capacity-output').innerHTML = `${allItemsTable}`;
  document.getElementById('selected-items-output').innerHTML = `${selectedItemsTable}`;
  document.getElementById('total-weight-output').innerHTML = `${additionalDataOutput}`;
}
function clearInputs() {
  capacityInput.value = '';
  itemNameInput.value = '';
  itemValueInput.value = '';
  itemWeightInput.value = '';
  items.length = 0; // Clear the array of created items
  isEditMode = false;
  editIndex = -1;

  const objectsCreatedTitle = document.getElementById('objects-created-title');
  objectsCreatedTitle.textContent = 'Objetos Creados: 0';

  showItems();

  const capacityOutput = document.getElementById('capacity-output');
  capacityOutput.innerHTML = '';
  const allItemsOutput = document.getElementById('all-items-output');
  allItemsOutput.innerHTML = '';
  const selectedItemsOutput = document.getElementById('selected-items-output');
  selectedItemsOutput.innerHTML = '';
  const totalWeightOutput = document.getElementById('total-weight-output');
  totalWeightOutput.innerHTML = '';
}