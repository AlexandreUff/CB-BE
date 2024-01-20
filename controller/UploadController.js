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
      user['data status'] = addDays(new Date(1899, 11, 30), user['data status'])
    } else {
      user['data status'] = new Date(user['data status'])
    }

    return user
  })

  const orderedUsersByDates = usersWithDatePartner.sort((user1, user2) => {
    return new Date(user1['data status']) - new Date(user2['data status'])
  })

  /* console.log("Total de usuários ativos:", totalUsersActived) */
  console.log("Usuários ordenados:", orderedUsersByDates)
}

module.exports = class UploadController {
  static async createSheet(req, res) {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    const filePath = req.file.path;
  
    // Verificar o tipo de arquivo e realizar o tratamento adequado
    if (path.extname(req.file.originalname).toLowerCase() === '.xlsx') {

        const data = sheetXLSXToJsonHandler(filePath)
        MRRHandler(data)
        console.log('Arquivo Excel enviado:', req.file.filename);

    } else if (path.extname(req.file.originalname).toLowerCase() === '.csv') {
        // Tratar arquivo CSV
        console.log('Arquivo CSV enviado:', req.file.filename);
    } else {
        return res.status(400).send('Formato de arquivo não suportado.');
    }
  
    return res.send('Arquivo enviado com sucesso!');
  }

  static upload = upload
};
