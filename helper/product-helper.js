const { response } = require('../app')
var objectid=require('mongodb').ObjectID
var db=require('../config/connection')
module.exports={
    addProduct:(product,callback)=>{
        product.price=parseInt(product.price)
        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
        })
        
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection('product').find().toArray()
            resolve(products)
        })
    },
    delete:(proid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('product').removeOne({_id:objectid(proid)}).then(()=>{[
                resolve(response)
            ]})
        })
    },
    view:(item)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('product').findOne({_id:objectid(item)}).then((result)=>{
                resolve(result)
            })
        })
    },
    upgrade:(Id,content)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('product').updateOne({_id:objectid(Id)},{
                $set:{
                    name:content.name,
                    discription:content.discription,
                    image:content.image,
                    category:content.category,
                    price:parseInt(content.price)
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
}