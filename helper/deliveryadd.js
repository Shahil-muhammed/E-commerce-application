var db=require('../config/connection')
var objectid=require('mongodb').ObjectID
const Promise=require('promise')
module.exports={
    delivery:(userId)=>{
        console.log(userId)
        return new Promise(async(resolve,reject)=>{
            order=await db.get().collection('new').find({userid:objectid(userId)}).toArray()
            resolve(order)
        })
    }
}