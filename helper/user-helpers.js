var db=require('../config/connection')
var objectid=require('mongodb').ObjectID
const bcrypt=require('bcrypt')
const Promise=require('promise')
module.exports={
    doSignup:(userData=>{
        return new Promise(async(resolve,reject)=>{
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection('user').insertOne(userData).then((data)=>{
                resolve(data.ops[0])
            })
        })
    }),
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection('user').findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then(function(result){
                    if(result){
                        console.log('login success')
                        console.log('true')
                        response.user=user
                        response.status=true
                        resolve(response)

                    }else{
                        console.log("loging failed")
                        resolve({status:false})
                    }
                })
            }else{
                console.log("logs failed")
                resolve({status:false})
            }
        })
    },
    addToCart:(porid,userid)=>{
        let quantity=1
        let proObj={
            item:objectid(porid),
            quantity
        }
        return new Promise(async(resolve,reject)=>{
            userCart=await db.get().collection('cart').findOne({user:objectid(userid)})
            if(userCart){
                let proExist=await userCart.product.findIndex(product=>product.item==porid)
                if(proExist!=-1){
                    let sha=objectid(porid)
                    await db.get().collection('cart').updateOne({user:objectid(userid),'product.item':sha},
                    {
                        $inc:{'product.$.quantity':1}
                    }                    ).then((response)=>{
                        resolve()
                    })
                }else{
                db.get().collection('cart').updateOne({user:objectid(userid)},
                {
                    $push:{product:proObj}
                }
                ).then((response)=>{
                    resolve()
                })
                }
            }else{
                let userconst=objectid(userid)
                let cartobj={
                    user:userconst,
                    product:[proObj]
                }
                db.get().collection('cart').insertOne(cartobj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    CrtItem:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            let CartItems=await db.get().collection('cart').aggregate([
                {
                    $match:{user:objectid(userid)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:"$product.item",
                        quantity:"$product.quantity"
                    }
                },
                {
                    $lookup:{
                        from:'product',
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
                
            ]).toArray().then((product)=>{
                console.log(product.product)
                resolve(product)
            })
        })
    },
    changepq:(response)=>{
        let count=parseInt(response.count)
        let cart=objectid(response.cart)
        let product=objectid(response.product)
        return new Promise((resolve,reject)=>{
            db.get().collection('cart').updateOne({_id:cart,'product.item':product},
                    {
                        $inc:{'product.$.quantity':count}
                    }                    ).then((response)=>{
                        if(response){
                            resolve()
                        }
                        else{
                            console.log("error")
                        }
                    })
        })
    },
    totalPrice:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            let total=await db.get().collection('cart').aggregate([
                {
                    $match:{user:objectid(userid)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:"$product.item",
                        quantity:"$product.quantity"
                    }
                },
                {
                    $lookup:{
                        from:'product',
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.price']}}
                    }
                }
                
            ]).toArray()
            if(total[0]!=null){
                resolve(total[0].total)
            }else{
                resolve()
            }
        })
    },
    placeorder:(order,product,total)=>{
        let dateTime = new Date();

        return new Promise(async(resolve,reject)=>{
            console.log(order,total,product)
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode,
                    date:dateTime
                },
                userid:objectid(order.userid),
                paymentMethod:order['payment-method'],
                product:product,
                total:total,
                status:'placed'
            }
            db.get().collection('new').insertOne(orderObj).then((response)=>{
                db.get().collection('cart').removeOne({user:objectid(order.userid)})
                resolve({status:true})
            })
        })
    },
    cartproductlist:(userid)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection('cart').findOne({user:objectid(userid)})
            resolve(cart.product)
        })
    },
    deleteCartProduct:(cartid)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection('cart').drop({user:objectid(cartid)}).then((response)=>{
                resolve()
            })
        })
    },
    flipview:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection('new').aggregate([
                {
                    $match:{_id:objectid(orderId)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:"product",
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            console.log(orderItems)
            resolve(orderItems)
        })
    }
}