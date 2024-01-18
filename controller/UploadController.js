const multer = require('multer');
const path = require('path');

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
  
      // Verificar o tipo de arquivo e realizar o tratamento adequado
      if (path.extname(req.file.originalname).toLowerCase() === '.xlsx') {
        // Tratar arquivo Excel (.xlsx)
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
