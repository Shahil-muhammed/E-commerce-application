var express = require('express');
const { response } = require('../app');
var router = express.Router();
var product=require('../helper/product-helper')
const user=require('../helper/user-helpers')
const delivery=require('../helper/deliveryadd');
const { __express } = require('hbs');
const { Session } = require('express-session');
const { ObjectId } = require('mongodb');
const verifyLogin=(req,res,next)=>{
  
  if(req.session.loggedin){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', function(req, res, next) {
  let User=req.session.user
  product.getAllProducts().then((products)=>{
    res.render('user/view-products',{user:true,products,User})
  })
});
router.get('/login',(req,res)=>{
  if(req.session.loggedin){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginErr":req.session.loginErr})
    req.session.loginErr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  user.doSignup(req.body).then((response)=>{
    console.log(response)
    req.session.loggedin=true
    req.session.user=response
    res.redirect('/login')
  })
})
router.post('/login',(req,res)=>{
  user.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedin=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.loginErr=true
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/login')
})
router.get('/cart',verifyLogin,async(req,res)=>{
let item=await user.CrtItem(req.session.user._id)
let total=await user.totalPrice(req.session.user._id)
let id=await item._id
res.render('user//Cart',{item,total,id})
})
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  user.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
  })
})
router.post('/change-product-quantity',verifyLogin,(req,res,next)=>{
  user.changepq(req.body).then((response)=>{
    res.redirect('/cart')
    res.json(response)
  })
})
router.get('/checkout',verifyLogin,async(req,res)=>{
  let total=await user.totalPrice(req.session.user._id)
  let sha=req.session.user._id
  res.render('user/checkout',{total,sha})
})
router.post('/place-order',verifyLogin,async(req,res)=>{
  let product=await user.cartproductlist(req.body.userid)
  let totalAmount=await user.totalPrice(req.session.user._id)
  user.placeorder(req.body,product,totalAmount).then((response)=>{
    res.json(response)
  })
  console.log(req.body)
})
router.get('/delete-cart-item/:id',verifyLogin,async(req,res)=>{
  user.deleteCartProduct(req.cartid).then((response)=>{
    res.redirect('/cart')
  })
})
router.get('/order-placed-successfully',verifyLogin,(req,res)=>{
  res.render('user/orderplaced',{user:req.session.user})
})
router.get('/myorders',verifyLogin,async(req,res)=>{
  let orders=await delivery.delivery(req.session.user._id)
  res.render('user/orderlist',{user:req.session.user,orders})
})
router.get('/view-order-product/:id',verifyLogin,async(req,res)=>{
  console.log(req.params.id)
  let product=await user.flipview(req.params.id)
  let sha=await user.totalPrice(req.session.user._id)
  console.log(sha)
  res.render('user/view-order-product',{product})
  console.log(product)
})
module.exports = router;
