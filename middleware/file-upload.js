const multer = require('multer');
const uuid = require('uuid').v1;

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/gif': 'gif'
}

const fileUpload = multer({
    limits: 500000, // 500kb
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/images')
        },
        filename: (req, file, cb) => {
            const ext = MIME_TYPE_MAP[file.mimetype]
            cb(null, uuid() + '.' + ext);
        }

    }),
    fileFilter: (req, file, cb) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        let err = isValid ? null : new Error('Invalid mime type');
        cb(err, isValid);
    }


})

module.exports = fileUpload;