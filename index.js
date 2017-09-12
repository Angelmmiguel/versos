// CLI Tools
const inquirer = require('inquirer');
const mv = require('mv');
const fs = require('fs');

// Current proposals
const proposals = fs.readdirSync('./poems/proposals/').filter((el) => el !== 'README.md');

// Menu
const menu = [
  {
    type: 'list',
    name: 'action',
    message: 'Selecciona la acción que quieras realizar',
    choices: ['Promocionar', 'Añadir un poema']
  },
  {
    type: 'list',
    name: 'promotePoem',
    message: 'Selecciona el poema que promocionar',
    choices: proposals,
    when: (res) => res.action === 'Promocionar'
  },
  {
    type: 'list',
    name: 'promoteWhen',
    message: 'Cuándo quieres que aparezca?',
    choices: ['Mañana', 'Pasado mañana', 'El día siguiente', 'Otra fecha'],
    when: (res) => res.action === 'Promocionar'
  },
  {
    type: 'input',
    name: 'promoteOtherDate',
    message: 'Escribe la fecha deseada (YYYY/MM/DD)',
    validate: function (value) {
      var pass = value.match(/^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/i);
      if (pass) {
        return true;
      }
      return 'El formato no es correcto: (YYYY/MM/DD)';
    },
    when: (res) => res.action === 'Promocionar' && res.promoteWhen === 'Otra fecha'
  }
]

// Get the path date based on the response
const getPathFromDate = (when, other) => {
  const date = new Date();

  switch(when) {
    case 'Mañana':
      date.setDate(date.getDate() + 1);
      break;
    case 'Pasado mañana':
      date.setDate(date.getDate() + 2);
      break;
    case 'El día siguiente':
      date.setDate(date.getDate() + 3);
      break;
  }

  return other !== undefined ? other : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart('2', '0')}/${date.getDate().toString().padStart('2', '0')}`;
}

const editLatest = async (datePath) => {
  const file = './poems/latest';
  return fs.writeFileSync(file, datePath);
}

// Promote a poem
const promote = (res) => {
  const path = getPathFromDate(res.promoteWhen, res.promoteOtherDate);
  const completePath = `./poems/daily/${path}.md`;

  if (fs.existsSync(completePath)) {
    console.error(`El fichero ${path} ya existe!! Selecciona otro día`);
    return;
  }

  mv(`./poems/proposals/${res.promotePoem}`, completePath, function(err) {
    if (!err) {
      console.log('El poema ha sido promocionado');
      editLatest(path)
        .then(() => { console.log('Actualizado el fichero latest.') })
        .catch((err) => console.error(`Error modificando el fichero ./poems/latest!!: ${err}`));
    } else {
      console.error(`Hubo un error al mover el fichero: ${err}`);
    }
  });
}

// Main menu
inquirer.prompt(menu).then(function (res) {
  switch(res.action) {
    case 'Añadir un poema':
      console.log('TODO!');
      break;
    case 'Promocionar':
      promote(res);
      break;
  }
});
