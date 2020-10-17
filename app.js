const express = require('express')
const bodyParser = require('body-parser')
const moment = require("moment")
const mongoose = require('mongoose')
require('mongodb')
require('./db/mongoose')

const app=express()

const port = process.env.PORT || 3000

app.set('view engine' ,'ejs')
app.use(bodyParser.urlencoded({extended: true}))

//mongoose
const itemSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true
    }
})

const Item = new mongoose.model('Item' , itemSchema)

const item1 = new Item({
    name: 'Welcome to todo list'
})

const item2 = new Item({
    name: 'Welcome to the todo list'
})

const item3 = new Item({
    name: 'Welcome todo list.'
})

const defaultItems = [item1 ,item2 ,item3]

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})

const List = mongoose.model('List' , listSchema)

//Routers
app.get('/' , async (req,res)=>{
    try{
        //const today = await moment().format("dddd, MMMM D")

        const result = await Item.find({})
    
        if(result.length === 0){
            await Item.insertMany(defaultItems)
            res.redirect('/')
        }
        else{
            res.render('list' ,{
                listTitle: 'Today' ,
                newListItem: result
            })
        }
    }
    catch(err){
        console.log(err)
    }
})

app.post('/' , async (req,res)=>{
    try{
        const itemName = req.body.newItem
        const listName = req.body.list

        const item = new Item({
            name: itemName
        })

        if(listName === "Today"){
            await item.save()
            res.redirect('/')
        }
        else{
            const foundList = await List.findOne({name:listName})
            foundList.items.push(item)
            await foundList.save()
            res.redirect('/' + listName)
        }
    }
    catch(e){
        console.log(e)
    }
})

app.post('/delete' , async (req,res)=>{
    try{
        const checkItemId = req.body.checkbox
        const listName = req.body.listName

        if(listName === 'Today'){
            await Item.findByIdAndDelete(checkItemId)
            res.redirect('/')
        }
        else{
            await List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkItemId}}})
            res.redirect('/' + listName)
        }

    }
    catch(e){
        console.log(e)
    }
})

app.get('/:customListName' ,async (req,res)=>{
    try{
        const customListName = req.params.customListName

        const foundList = await List.findOne({name:customListName})
    
        if(!foundList){
            const list = new List({
                name: customListName,
                items: defaultItems
            })
            await list.save()
            res.redirect('/' + customListName)
        }
        else{
            res.render('list' ,{
                listTitle: foundList.name ,
                newListItem: foundList.items
            })
        }
    }
    catch(e){
        console.log(e)
    }
    
})

// app.get('/work' , (req,res)=>{
//     res.render('work' ,{
//         listTitle: 'Work List' ,
//         newListItem: workItems
//     })
// })
// 
// app.post('/work' , (req,res)=>{
//     const item = req.body.newItem
//     workItems.push(item)
//     res.redirect('/work')
// })

app.listen(port , ()=>{
    console.log('Server started')
})