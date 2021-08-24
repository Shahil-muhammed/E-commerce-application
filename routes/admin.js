var express = require('express');
const { view } = require('../helper/product-helper');
var router = express.Router();
var product=require('../helper/product-helper')

/* GET users listing. */
router.get('/', function(req, res, next) {
  product.getAllProducts().then((products)=>{
    res.render('admin/view-product',{admin:true,products})
  })
});
  router.get('/add-product',function(req,res){
    res.render('admin/add-product')
  })
  router.post('/add-product',(req,res)=>{
    console.log(req.body)
    product.addProduct(req.body,(id)=>{
      res.render('admin/add-product')
      })
    })
    router.get('/delete-product/:id',(req,res)=>{
      let proid=req.params.id
      product.delete(proid).then((response)=>{
        res.redirect('/admin/')
      })
    })
    router.get('/edit-product/:id',async(req,res)=>{
      let edit=await product.view(req.params.id)
      res.render('admin/edit-product',{edit})
    })
    router.post('/edit-product/:id',(req,res)=>{
      product.upgrade(req.params.id,req.body).then(()=>{
        res.redirect('/admin')
      })
    })

module.exports = router;
