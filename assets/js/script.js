// empty tasks array to push tasks into
var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// uses event delegation to offset the click event to a parent that will always exist, then checking which child element triggered the event
// .list-group is the parent
// p is the child
// get task value when selecting task to edit
$(".list-group").on("click", "p", function() {
  // get the value of the <p> this you clicked on
  var text = $(this)
    .text()
    .trim();

  // creates a new HTML element <textarea> but need to append it to the page
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  // instead of appending, we're replacing <p> with <textarea> on click
  $(this).replaceWith(textInput);

  // when you click the <p> text, the container is highlighted
  textInput.trigger("focus");
});

// value of task has changed
$(".list-group").on("blur", "textarea", function() {
  // get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    // replace list- with "" --> means to just delete list-
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // set the specific task's text with the new text
  // tasks is an object
  // tasks[status] returns an array from loadTasks(); function
  // tasks[status][index] returns the object at the given index in the array
  // tasks[status][index].text returns the text property of the object at the given index.
  // tasks[id=list- ][index].text = text
  tasks[status][index].text = text;

  // to update this tasks object in the var tasks =
  saveTasks();

  // now save <textarea> back to <p>
  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);

});

// edit date value
$(".list-group").on("click", "span", function () {
  // get the value of <span> you click on
  var date = $(this)
    .text()
    .trim();
  
  // create HTML element for due date
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    // set the value to the current date
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

// elements with class - .card and .list-group
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  // update the corresponding tasks lists in local storage when an <li> is moved
  update: function(event) {

    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable parent list
    $(this).children().each(function() { // this 'this' is the parent <il>

      // in the <li> child find <p> & get the text value --> assign it to var text
      var text = $(this) // this 'this' is the child <li>
      .find("p")
      .text()
      .trim();
      
      // in the <li> child find <span> & get the text value --> assign it to var date
      var date = $(this)
      .find("span")
      .text()
      .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trim down list's ID to match object property // example list-toDo --> toDo
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();

    console.log(arrName);
  }  
});

