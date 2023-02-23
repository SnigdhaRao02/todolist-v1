
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js")  //as this is local file
const mongoose = require('mongoose');
const _ = require('lodash'); //JS library
require('dotenv').config();

const app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// let day = date();     //calling function that is bound to the constant date
var days = ["Sunday", "Monday", "Tuesday",
           "Wednesday", "Thursday", "Friday", "Saturday"
      ];

//connecting to DB
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true,dbName:"todolistDB"});

//schema and model for DB
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);

//default documents for DB
const item1 = new Item({
  name: "Welcome to the to-do list app!"
});
const item2 = new Item({
  name: "<-- Click here to delete an item."
});
const item3 = new Item({
  name: "Enter text and click on + icon to add new item."
});

const defaultItems = [item1,item2,item3];

//for custom lists
const listSchema= mongoose.Schema({
  name: String,  //name of list
  items: [itemSchema]
});
const List=mongoose.mongoose.model("List", listSchema);



//main page
app.get("/", function(req, res){

  Item.find(function(err, item){
    if(item.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err) console.log(err);
        else console.log("Successfully saved default items!");
      })
    }
    else{
      res.render("list", { ListTitle:"today", newListItems : item});
    }
  })


})

//custom list page
app.get("/:customListName", function(req,res){
  // console.log(req.params.customListName);
  let customListName= _.capitalize(req.params.customListName); //to convert lowercase to titlecase

  List.findOne({name:customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        //create new list
        const listItem= new List({
          name: customListName,
          items: defaultItems
        });
         listItem.save()
         res.redirect("/"+customListName);
      }else{
        //show existing list
        res.render("list", {ListTitle:foundList.name, newListItems : foundList.items})
      }
    }
  })

  
})

//POST ROUTE FOR ADDING NEW ITEMS
app.post("/", function(req, res){
  var itemName = req.body.newItem;
  //adding item to custom list
  var listName= req.body.list;
 
  //creating new item document
    const newItem = new Item({
      name: itemName
    });

    if(listName==="today"){
      newItem.save();
      res.redirect("/");
    }else{
      List.findOne({name:listName},function(err,foundList){
        if(!err){
          foundList.items.push(newItem);
          foundList.save();
          res.redirect("/"+listName);
        }
      })
    }
    
 
  
})

//POST ROUTE FOR DELETING ITEMS
app.post("/delete", function(req,res){
  var checkbox_id = req.body.check_value;
  var listName = req.body.listName;
  // console.log(checkbox_id);

  if(listName==="today"){
    Item.findByIdAndRemove(checkbox_id, function(err){
      if(err) console.log(err);
      else console.log("Deleted item from DB");
    });
    res.redirect("/");
  }else{
    //pull : to delete from array
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkbox_id}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  

  
})



app.listen(3000, function(){
  console.log("server started on port 3000");
})
