const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const { addDays } = require('date-fns');

// Configuração do multer para o armazenamento dos arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // O diretório onde os arquivos serão armazenados
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const sheetXLSXToJsonHandler = (filePath) => {
  // Tratar arquivo Excel (.xlsx)
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  // Aqui você pode fazer o tratamento dos dados, por exemplo, salvar no banco de dados ou manipular de alguma outra forma.

  return data
}

const MRRHandler = (data) => {
  /* let totalUsersActived = 0

  
  data.map((user, i) => {  
    if(user.status === 'Ativa'){
      totalUsersActived++
      console.log(
        "|Usueiro:",user['ID assinante'],
        "|Valor:", user.valor, "|Data status:",
        typeof user['data status'] !== "string" ? addDays(new Date(1899, 11, 30),
          user['data status']) : new Date(user['data status']),
        "|Padrão bruto:", user['data status'])
    }
  }) */
  

  const activedUsers = data.filter(user => {  
    if(user.status === 'Ativa'){
      return user
    }
  })

  const usersWithDatePartner = activedUsers.map(user => {
    if(typeof user['data status'] !== "string"){
      /* console.log("number") */
      user['data status'] = addDays(new Date(1899, 11, 30), user['data status'])
    } else {
      user['data status'] = new Date(user['data status'])
    }

    /* console.log("Data:", user['data status'], "User:", user['ID assinante']) */
    return user
  })

  const orderedUsersByDates = usersWithDatePartner.sort((user1, user2) => {
    return new Date(user1['data status']) - new Date(user2['data status'])
  })

  let year = 0
  let month = 0
  let averageValuesPerMonth = []
  let arrayIndex = 0
  let userAmount = 1

  orderedUsersByDates.forEach(user => {
    if(user['data status'].getFullYear() === year) {
      if(user['data status'].getMonth() === month){

        arrayIndex = averageValuesPerMonth.findIndex(period => {
          return period.monthAndYear.getFullYear() === year && period.monthAndYear.getMonth() === month
        })

        averageValuesPerMonth[arrayIndex].averageValue += user.valor
        userAmount++
        /* Precisar pôr a média dos valores */

      } else {
        if(arrayIndex-1 >= 0){
          averageValuesPerMonth[arrayIndex-1].averageValue = averageValuesPerMonth[arrayIndex-1].averageValue / userAmount
        }

        month = user['data status'].getMonth()

        averageValuesPerMonth.push({
          monthAndYear: new Date(year, month),
          averageValue: user.valor
        })
      }
      
    } else {
      if(arrayIndex-1 >= 0){
        averageValuesPerMonth[arrayIndex-1].averageValue = (averageValuesPerMonth[arrayIndex-1].averageValue / userAmount).toFixed(2)
      }

      year = user['data status'].getFullYear()
      month = user['data status'].getMonth()

      /* console.log("Pega ano/data:", user['data status'].getFullYear(), user['data status'].getMonth()) */

      averageValuesPerMonth.push({
        monthAndYear: new Date(year, month),
        averageValue: user.valor
      })
    }
  })

  /* console.log("Total de usuários ativos:", totalUsersActived) */
  /* console.log("Usuários ordenados:", orderedUsersByDates) */
  console.log("Usuários em MRR", averageValuesPerMonth)
  return averageValuesPerMonth
}

module.exports = class UploadController {
  static async createSheet(req, res) {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    const filePath = req.file.path;
    let dataHandled
  
    // Verificar o tipo de arquivo e realizar o tratamento adequado
    if (path.extname(req.file.originalname).toLowerCase() === '.xlsx') {

        const data = sheetXLSXToJsonHandler(filePath)
        dataHandled = MRRHandler(data)
        console.log('Arquivo Excel enviado:', req.file.filename);

    } else if (path.extname(req.file.originalname).toLowerCase() === '.csv') {
        // Tratar arquivo CSV
        const data = sheetXLSXToJsonHandler(filePath)
        dataHandled = MRRHandler(data)
        console.log('Arquivo CSV enviado:', req.file.filename);
    } else {
        return res.status(400).send('Formato de arquivo não suportado.');
    }
  
    return res.send(dataHandled);
  }

  static upload = upload
};
