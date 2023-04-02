const bodyParser = require('body-parser');
const express=require('express');
const { redirect } = require('statuses');
const mongoose=require('mongoose');


let items=["Get up by 5 a.m.","Meditation For atleast 20 minute","Atleast 3 DSA questions"];


const app=express();

// We have to set view engine to the ejs module in order to work on the web page.......
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));

// Setting a connectionn to a database........
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true});

// Schema for database.....
const itemSchema={
  name:String,
};

// Making the table.....
const Item=mongoose.model("item",itemSchema);



// Creating entriess.........
const item1=new Item({
  name:"Welcome To Do List"
});
const item2=new Item({
  name:"Hit the + button to add the item"
});
const item3=new Item({
  name:"<-- Hit this to Delete an item"
});

const itemList=[item1,item2,item3];


const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);

 

// We can't use the css or html files directly by server, so we have to move them to a folder and 
//... tell the server file to look into the folder set by us for static css html files........
app.use(express.static("public"))



// For HomePage of Website.......
app.get("/",function(req,res){

// ***** TO FIND ALL THE ENTRIESSS IN DATABASE COLLECTION ***** ............... 
Item.find({}).then(function(foundItems){

  if(foundItems.length === 0){
    // New Way to Insert the Items(In MANY FORM)............
      Item.insertMany(itemList).then(function () {
      console.log("Successfully saved defult items to DB");
        })
          .catch(function (err) {
              console.log(err);
          });

          res.redirect("/");
  } else{
          res.render('index',{listTitle:"Today",newlistItems:foundItems});
  }
  
})
.catch(function(err){
  console.log(err);
});
  
});


// **** For Creating the Custom List **** .......
app.get("/:customListName",function(req,res){

  const customListName=req.params.customListName;

  List.findOne({name:customListName}).then(function(foundList){
    if(!foundList){
      const list =new List({
        name: customListName,
        items: itemList
      });

      list.save();
      res.redirect("/"+ customListName);
    }
    else{
      res.render('index',{listTitle:foundList.name,newlistItems:foundList.items});
    }
  }).catch(function(err){
    console.log(err);
  });



  const list=new List({
    name:customListName,
    items: itemList
  });

  list.save();

});


// For about page of WebPage.......
app.get("/about",function(req,res){
    res.render("about");
});

// For Work ToDo List Page......
app.get("/work",function(req,res){
    res.render("index",{listTitle:"Work List",newlistItems:workIems});
});



// Getting data from ToDo List Page.....
app.post("/",function(req,res){
  var newItem = req.body.addItem;
  const listName=req.body.list;

  const item =new Item({
    name:newItem
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
  
});


// **** Deleting the data from DATABASE **** ...........
app.post("/delete",function(req,res){

  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;


  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId).then(function(){
      console.log("Deleted");
      res.redirect("/");
    }).
    catch(function(err){
      console.log(err);
    });
  }
  else{

      const foundList=List.findOneAndUpdate({name:listName}, { $pull: {items: {_id:checkedItemId} } }).then(function(foundList){
          res.redirect("/"+listName);
      })
      .catch(function(err){
          console.log(err);
      });
  }

});


// Getting data from Work List Page.....
app.post("/work",function(req,res){
    var item= req.body.addItem;
    workIems.push(item);
  
    res.redirect("/work");
  });




app.listen(8000,function(){
    console.log("Listening at 8000 port");
});