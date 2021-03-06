
function predict_click(value, source) {
  // first grab current index
  var index = document.getElementById("hidden-counter").value;

  // Div Stuff
  if(index > 1) {
    createNewDisplayDiv(index);
  }

  if(source === "url") {
    document.getElementById("img_preview" + index).src = value;
    doPredict({ url: value });

    // Div Stuff
    createHiddenDivs("url", value);
  }

  else if(source === "file") {
    var preview = document.querySelector("#img_preview" + index);
    var file    = document.querySelector("input[type=file]").files[0];
    var reader  = new FileReader();

    // load local file picture
    reader.addEventListener("load", function () {
      preview.src = reader.result;
      var localBase64 = reader.result.split("base64,")[1];
      doPredict({ base64: localBase64 });

      // Div Stuff
      createHiddenDivs("base64", localBase64);

    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  }
}

/*
  Purpose: Does a v2 prediction based on user input
  Args:
    value - Either {url : urlValue} or { base64 : base64Value }
*/
function doPredict(value) {

  var modelID = getSelectedModel();

  app.models.predict(modelID, value).then(

    function(response) {
      console.log(response);
      var conceptNames = "";
      var tagArray, regionArray;
      var tagCount = 0;
      var modelName = response.rawData.outputs[0].model.name;
      var modelNameShort = modelName.split("-")[0];
      var modelHeader = '<b><span style="font-size:14px">' + capitalize(modelNameShort) + ' Model</span></b>';

      // Check for regions models first



      // Generic tag response models
      if(response.rawData.outputs[0].data.hasOwnProperty("concepts")) {
        tagArray = response.rawData.outputs[0].data.concepts;

        for (var other = 0; other < tagArray.length; other++) {
          conceptNames += '<li>' + tagArray[other].name + ': <i>' + tagArray[other].value + '</i></li>';
        }
        var list = [];

        for(let i=0;i<5;i++){
          //console.log("Hello");
          list.push(tagArray[i].name);
        }
        for(let i=0;i<5;i++){
          //console.log("Hello");
          console.log(list[i]);
        }
        tagCount=tagArray.length;

      }
      var config = {
        apiKey: "AIzaSyDhRzanCPk1hkvsB27v-c1rl1Nb0dUFWxE",
        authDomain: "food-app-52a89.firebaseapp.com",
        databaseURL: "https://food-app-52a89.firebaseio.com",
        projectId: "food-app-52a89",
        storageBucket: "food-app-52a89.appspot.com",
        messagingSenderId: "727906035479"
      };
      firebase.initializeApp(config);
      var ref = firebase.database().ref('Food');

      var food_calorie;
      ref.on('value', function(snapshot) {
        //console.log("this is snapshot",snapshot.val());
        snapshot.forEach(function(childSnapshot) {
              var childData = childSnapshot.val();
              var a = childData.foodname;
              //console.log("this is a",a)
              if(a == tagArray[0].name){
                  console.log(childData.calorie);
                  food_calorie = childData.calorie;
                  $("#name").append("<p>" + food_calorie + "</p>");
                  
                }
            });

      });



    //  $("#name").append(food_calorie);

      var columnCount = tagCount / 10;

      // Focus gets one more column
      if(modelName == "focus") {
      	columnCount += 1;
      }

      conceptNames = '<ul style="margin-right:20px; margin-top:20px; columns:' + columnCount + '; -webkit-columns:' + columnCount + '; -moz-columns:' + columnCount + ';">' + conceptNames;

      conceptNames += '</ul>';
      conceptNames = modelHeader + conceptNames;

      $('#concepts').html(conceptNames);


    },
    function(err) {
      console.log(err);
    }
  );
}

/*
  Purpose: Return a back-end model id based on current user selection
  Returns:
    Back-end model id
*/
function getSelectedModel() {
  var model = document.querySelector('input[name = "model"]:checked').value;

  if(model === "general") {
    return Clarifai.FOOD_MODEL;
  }
  else if(model === "custom") {
    var e = document.getElementById("custom_models_dropdown");
    return e.options[e.selectedIndex].value;
  }
}



/*
  Purpose: Create a dynamic div to store entire user session
  Args:
    index - # of the image in the session
*/
function createNewDisplayDiv(index) {
  var mainDiv = document.getElementById("predictions");

  var elem = document.createElement('div');
  elem.innerHTML =
    '<div style="margin-top:30px; margin-left:20px; margin-bottom:30px; clear:left; float:left"> \
      <img id="img_preview' + index + '" src="" width="400"/> \
      <br/> \
    </div> \
    <div id="concepts" class="conceptBox"> \
    </div>';

  mainDiv.innerHTML = elem.innerHTML + mainDiv.innerHTML;
}

/*
  Purpose: Creates hidden Div elements to store info of each picture uploaded
  Args:
    urlOrBase64 - binary variable to store the type of image
    source - the actual URL string or the base64
*/
function createHiddenDivs(urlOrBase64, source) {
  // first grab current index
  var index = document.getElementById("hidden-counter").value;

  // type
  var input1 = document.createElement("input");
  input1.setAttribute("type", "hidden");
  input1.setAttribute("id", "hidden-type"+index);
  input1.setAttribute("name", "hidden-type"+index);
  input1.setAttribute("value", urlOrBase64);

  // value
  var input2 = document.createElement("input");
  input2.setAttribute("type", "hidden");
  input2.setAttribute("id", "hidden-val"+index);
  input2.setAttribute("name", "hidden-val"+index);
  input2.setAttribute("value", source);

  // add new inputs to page
  document.getElementsByTagName('body')[0].appendChild(input1);
  document.getElementsByTagName('body')[0].appendChild(input2);

  // increment index
  document.getElementById("hidden-counter").value = parseInt(index)+1;
}

/*
  Purpose: Return a capitalized String
  Args:
    s - A String
*/
function capitalize(s)
{
  return s[0].toUpperCase() + s.slice(1);
}
