const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const csv = require('csv-parser');

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

module.exports = class UploadController {
  static async createSheet(req, res) {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    const filePath = req.file.path;
  
    // Verificar o tipo de arquivo e realizar o tratamento adequado
    if (path.extname(req.file.originalname).toLowerCase() === '.xlsx') {
        // Tratar arquivo Excel (.xlsx)

        // Tratar arquivo Excel (.xlsx)
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        // Aqui você pode fazer o tratamento dos dados, por exemplo, salvar no banco de dados ou manipular de alguma outra forma.
        console.log('Arquivo Excel enviado:', req.file.filename);
        //Const data é o retorno

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
