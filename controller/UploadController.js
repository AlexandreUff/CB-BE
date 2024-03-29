const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const { addDays } = require('date-fns');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const sheetXLSXToJsonHandler = (filePath) => {
    const workbook = xlsx.read(filePath, {type: 'buffer'})
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  return data
}

const usersDataHandler = (data) => {
  const usersWithDatePartner = data.map(user => {
    if(typeof user['data status'] !== "string"){
      user['data status'] = addDays(new Date(1899, 11, 30), user['data status'])
    } else {
      user['data status'] = new Date(user['data status'])
    }

    return user
  })

  const orderedUsersByDates = usersWithDatePartner.sort((user1, user2) => {
    return new Date(user1['data status']) - new Date(user2['data status'])
  })

  return orderedUsersByDates
}

const ChurRateHandler = (data) => {
  const desactivedUsers = data.filter(user => {  
    if(user["data cancelamento"]){
      return user
    }
  })

  const usersHandled = usersDataHandler(desactivedUsers)

  let year = 0
  let month = 0
  let desactivedUsersPerMonth = []
  let arrayIndex = 0
  let userAmount = 1

  usersHandled.forEach(user => {
    if(user['data status'].getFullYear() === year) {
      if(user['data status'].getMonth() === month){

        arrayIndex = desactivedUsersPerMonth.findIndex(period => {
          return period.monthAndYear.getFullYear() === year && period.monthAndYear.getMonth() === month
        })

        desactivedUsersPerMonth[arrayIndex].amount++
        userAmount++

      } else {

        month = user['data status'].getMonth()

        desactivedUsersPerMonth.push({
          monthAndYear: new Date(year, month),
          amount: 1
        })
      }
      
    } else {
      year = user['data status'].getFullYear()
      month = user['data status'].getMonth()

      desactivedUsersPerMonth.push({
        monthAndYear: new Date(year, month),
        amount: 1
      })
    }
  })

  return desactivedUsersPerMonth
  
}

const MRRHandler = (data) => {

  const activedUsers = data.filter(user => {  
    if(user.status === 'Ativa'){
      return user
    }
  })

  const usersHandled = usersDataHandler(activedUsers)

  let year = 0
  let month = 0
  let averageValuesPerMonth = []
  let arrayIndex = 0
  let userAmount = 1

  usersHandled.forEach(user => {
    if(user['data status'].getFullYear() === year) {
      if(user['data status'].getMonth() === month){

        arrayIndex = averageValuesPerMonth.findIndex(period => {
          return period.monthAndYear.getFullYear() === year && period.monthAndYear.getMonth() === month
        })

        averageValuesPerMonth[arrayIndex].amount += +user.valor.toFixed(2)
        userAmount++

      } else {
        if(arrayIndex-1 >= 0){
          averageValuesPerMonth[arrayIndex-1].amount = +(averageValuesPerMonth[arrayIndex-1].amount / userAmount).toFixed(2)
        }

        month = user['data status'].getMonth()

        averageValuesPerMonth.push({
          monthAndYear: new Date(year, month),
          amount: +user.valor.toFixed(2)
        })
      }
      
    } else {
      if(arrayIndex-1 >= 0){
        averageValuesPerMonth[arrayIndex-1].amount = +(averageValuesPerMonth[arrayIndex-1].amount / userAmount).toFixed(2)
      }

      year = user['data status'].getFullYear()
      month = user['data status'].getMonth()

      averageValuesPerMonth.push({
        monthAndYear: new Date(year, month),
        amount: +user.valor.toFixed(2)
      })
    }
  })


  return averageValuesPerMonth
}

module.exports = class UploadController {
  static async createSheet(req, res) {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    const buffer = req.file.buffer;
    let dataHandled
  
    if (path.extname(req.file.originalname).toLowerCase() === '.xlsx') {

        const data = sheetXLSXToJsonHandler(buffer)
        dataHandled = [
          {
            name: "Churn Rate",
            data: ChurRateHandler(data),
          },
          {
            name: "MRR",
            data: MRRHandler(data),
          },
        ] 


    } else if (path.extname(req.file.originalname).toLowerCase() === '.csv') {
        const data = sheetXLSXToJsonHandler(buffer)
        dataHandled = [
          {
            name: "Churn Rate",
            data: ChurRateHandler(data),
          },
          {
            name: "MRR",
            data: MRRHandler(data),
          },
        ] 

    } else {
        return res.status(400).send('Formato de arquivo não suportado.');
    }
  
    return res.send(dataHandled);
  }

  static upload = upload
};
