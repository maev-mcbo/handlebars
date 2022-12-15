const { Router } = require('express')
const { dashboard, dashboardview } = require('../controllers/dasboardController')
const {pdf, pdfmaker} = require("../controllers/pdfcontroller")
const userisvalid = require("../middlewares/userisvalid")
router = Router();
    
router.get('/',userisvalid, dashboardview);

router.get('/cs', (req, res) => {
     const sesionactiva = req.session 
     res.json(sesionactiva)
});

router.get('/pdfmaker/:id?', pdfmaker);
router.get('/pdf/:id?' ,pdf);




router.get('/dashboard', dashboard);


module.exports = router
