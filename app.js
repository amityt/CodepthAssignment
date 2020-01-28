var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var ejsLint = require('ejs-lint');
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Posts = require("./models/posts");
var Users = require("./models/users");
var moment = require('moment');
var flash = require("connect-flash");

mongoose.connect("mongodb+srv://codepthassignment:akdvirat4july@cluster0-4maut.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true});


app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

//Passport Configuration
app.use(require("express-session")({
    secret:"Hello this is my codepth assignment",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());
app.use(flash());
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//Authentication Routes
//Registering User
app.get("/register", function(req,res){
    res.render("auth/register");
});
app.post("/register",function(req, res){
    var newUser = new Users({username: req.body.username});
    Users.register(newUser, req.body.password,function(err,users){
            if(err){
                console.log(err);
                req.flash("error",err.message);
                return res.redirect("/register");
            }
            passport.authenticate("local")(req,res,function(){
                req.flash("success", "Welcome to Codepth Blogs "+ users.username+"!");
                res.redirect("/main");
            });
    });
});

//Login User
app.get("/login",function(req,res){
    res.render("auth/login");
});

app.post("/login", passport.authenticate("local",
	{
		successRedirect: "/main",
        failureRedirect: "/login",
        failureFlash : true
	}), function(req,res){
});

//Logout
app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You've logged out!");
	res.redirect("/main");
});

app.get("/", function(req, res){
    res.render("home");
});

app.get("/main", function(req, res){
    Posts.find({},function(err, posts){
		if(err){
			console.log(err);
			console.log("Aggghh, error!");
		}
		else{
			res.render("main",{posts:posts, currentUser: req.user});
	}
	});
});

app.get("/main/oldest", function(req, res){
    Posts.find({}).sort('date').exec(function(err, posts){
		if(err){
			console.log(err);
			console.log("Aggghh, error!");
		}
		else{
			res.render("maindatefilter",{posts:posts});
	}
	});
});

app.get("/main/newest", function(req, res){
    Posts.find({}).sort('-date').exec(function(err, posts){
		if(err){
			console.log(err);
			console.log("Aggghh, error!");
		}
		else{
			res.render("maindatefilter",{posts:posts});
	}
	});
});

app.get("/main/:type/:filtertype/:id", function(req, res){
    Posts.findById(req.params.id, function(err, posts){
        if(err){
            console.log(err);
            console.log("Agghh, error!");
            res.send("Page not available!");
        }
        else{
            res.render("displaypage",{posts:posts});
        }
    });
});

app.get("/main/blogs/india", function(req, res){
    Posts.find({filtertype:"india",type:"blog"}, function(err, blogs){
    if(err){
        console.log(err);
    }
    else{
        res.render("blogs/blogindia",{blogs:blogs});	
    }
});
});

app.get("/main/blogs/international", function(req, res){
Posts.find({filtertype:"international",type:"blog"}, function(err, blogs){
    if(err){
        console.log(err);
    }
    else{
        res.render("blogs/bloginternational",{blogs:blogs});	
    }
});
});

app.get("/main/blogs/technology", function(req, res){
Posts.find({filtertype:"technology",type:"blog"}, function(err, blogs){
    if(err){
        console.log(err);
    }
    else{
        res.render("blogs/blogtechnology",{blogs:blogs});	
    }
});
});

//News Filter
app.get("/main/news/india", function(req, res){
    Posts.find({filtertype:"india",type:"news"}, function(err, news){
    if(err){
        console.log(err);
    }
    else{
        res.render("news/newsindia",{news:news});	
    }
});
});

app.get("/main/news/international", function(req, res){
Posts.find({filtertype:"international",type:"news"}, function(err, news){
    if(err){
        console.log(err);
    }
    else{
        res.render("news/newsinternational",{news:news});	
    }
});
});

app.get("/main/news/technology", function(req, res){
Posts.find({filtertype:"technology",type:"news"}, function(err, news){
    if(err){
        console.log(err);
    }
    else{
        res.render("news/newstechnology",{news:news});	
    }
});
});


app.get("/main/post/new",isLoggedIn, function(req,res){
	res.render("editcreate/newpost", {moment: moment});
});

app.post("/main/posts",isLoggedIn,function(req, res){
    var type = req.body.type;
	var name = req.body.name;
	var image = req.body.image;
    var desc = req.body.description;
    var filtertype = req.body.filtertype;
    var date = req.body.date;
    var author = {
        id:req.user._id,
        username:req.user.username
    }
	var newObj = {name: name , image: image, description: desc, type: type, date: date, type:type, filtertype:filtertype, author:author};
	Posts.create(newObj, function(err,newlyobj){
	if(err){
		console.log("Aghh error!");
		console.log(err);
	}
	else{
		console.log("Blog added succesfully!")	
		console.log(newlyobj);
		res.redirect("/main");
	}
});
});

//Edit post
app.get("/main/:type/:filtertype/:id/edit",checkCampgroundOwnership, function(req,res){
    Posts.findById(req.params.id, function(err, foundPost){
        res.render("editcreate/editpost", {posts: foundPost});		
  });
});
//Update post
app.put("/main/:type/:filtertype/:id",checkCampgroundOwnership, function(req, res){
	Posts.findByIdAndUpdate(req.params.id, req.body.posts, function(err, updatedPost){
		if(err){
			res.redirect("/main");
		}
		else{
            req.flash("success", "Post updated successfully!");
			res.redirect("/main/:type/:filtertype/"+req.params.id);
		}
	});
});
//Delete post
app.delete("/main/:type/:filtertype/:id", function(req, res){
    Posts.findByIdAndRemove(req.params.id, function(err,posts){
            if(err){
                res.redirect("/main");
            }
            else{
                req.flash("success", "Post deleted successfully!");
                res.redirect("/main");
            }
    })
})
//Middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
    }
    req.flash("error", "You need to be logged in to create a post.");
	res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next){
	if(req.isAuthenticated()){
		Posts.findById(req.params.id, function(err, foundPost){
		if(err){
			res.redirect("back");
		}
		else{
			//does user own the campground?
			if(foundPost.author.id.equals(req.user._id)){
				next();	
			}
			else{
				res.redirect("back");
			}
		}
		});
	}
		else{
            console.log("error", "You need to be logged in to do that!");
            req.flash("error", "You need to be logged in to do that.");
			res.redirect("/main");
		}
}

app.listen(process.env.PORT || 3000, () => {
    console.log("Server has started!!!!");
});