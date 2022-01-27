// empty tasks array to push tasks into
var tasks = {};

// create task
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

  // check due date before adding the task item to the page to make changes if req
  auditTask(taskLi);

  //If we have tasks saved, then they should automatically run through the auditTask() function and we can check the console to see if it works. If not, create a new task and check the console after submitting it

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

// load tasks from local storage
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

// save tasks to local storage
var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// checks the date of each task and compares it to the conditions
// with setInterval, the list items are checked every 30 min
var auditTask = function(taskEl) {
  // get current date text
  var date = $(taskEl)
    .find("span")
    .text()
    .trim();

  // convert the current date text to moment object at hour 5:00pm
  var time = moment(date, "L").set("hour", 17);

  // remove any of these classes if they were already in place
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  // This way, if we update the due date from yesterday to a week from now, that red background will be removed, as it will no longer be overdue

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } 
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
  // absolute value - comparing current date moment() & time (actual date of task)
  // if the difference is 2 days or less -- then it's due soon so yellow

  // // this should print out an object for the value of the date variable, but at 5:00pm of that date
  // console.log(time);

  console.log(taskEl);
};

// enable draggable/sortable feature on list-group elements
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    // console.log('activate', this); //same as ('activate', this);

    // makes lists gray when you move a task
    $(this).addClass('dropover');
    // makes trash pop up when you drag a task
    $(".bottom-trash").addClass('bottom-trash-drag');
  },
  deactivate: function(event) {
    // console.log('deactivate', this);

    // removes gray when task is done being moved
    $(this).removeClass('dropover');
    // removes trash pop once you stop dragging
    $(".bottom-trash").removeClass('bottom-trash-drag');
  },
  over: function(event) {
    // console.log(event);

    // can use $(this) here?
    $(event.target).addClass('dropover-active');
  },
  out: function(event) {
    // console.log(event);
    $(event.target).removeClass('dropover-active');
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
  }  
});


// trash icon can be dropped onto 
$("#trash").droppable({
  // accepts items with these classes
  accept: ".card .list-group-item",
  // will accept draggable when any amt of it overlaps droppable element
  tolerance: "touch",
  // signals that user is trying to delete a task
  drop: function(event, ui) {
    // console.log(ui);
    ui.draggable.remove();
    $(".bottom-trash").removeClass('bottom-trash-active');
  },
  // when draggable hovers over droppable
  over: function(event, ui) {
    // console.log("over");
    $(".bottom-trash").addClass('bottom-trash-active');
  },
  // triggers when accepted draggable is dragged out of the droppable
  out: function(event, ui) {
    // console.log("out");
    $(".bottom-trash").removeClass('bottom-trash-active');
  }
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

// task text was clicked
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
// uses event delegation to offset the click event to a parent that will always exist, then checking which child element triggered the event
// .list-group is the parent
// p is the child
// get task value when selecting task to edit

// editable field was un-focused and value of task has changed
// blur() method removes keyboard focus from the current element
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

// due date was clicked and can edit date value
$(".list-group").on("click", "span", function() {
  // get current text of <span> (this)
  var date = $(this).text().trim();

  // create new input element <input type="text" class="form-control">Date</input>
  var dateInput = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the `dateInput` = this
      $(this).trigger("change");
    }
  });
  // By adding the onClose method, we can instruct the dateInput element to trigger its own change event and execute the callback function tied to "change"

  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// update value of due date that was changed
// edit: blur to change to fix error
// change() method, saying attach this function to run when a change event occurs
$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();
  
  // get the parent ul's id attribute // example list-toDo = toDo
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position (index) in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to local storage // examples tasks[toDo][1].date
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element of <span> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
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

// add date picker 
$('#modalDueDate').datepicker({
  minDate: 1 // set the minimum date to be one day from the current date
});

// with set interval, the call back function is run after a certain amt of time --> executed always
// setTimeout executes function only once
setInterval(function () {
  $(".card .list-group-item").each(function(index, el) { //.each loops thru the function
    auditTask(el);
  });
}, (1000*60)*30); // every 30 min run the auditTask for every el
// the jQuery selector passes each element it finds using the selector into the callback function, and that element is expressed in the el argument of the function. 
// auditTask() then passes the element to its routines using the el argument
// In this interval, we loop over every task on the page with a class of list-group-item and execute the auditTask() function to check the due date of each one
// (1000*60)*30) --> multiply 1,000 milliseconds by 60 to convert it to 1 minute. Then we multiply that minute by 30 to get a 30-minute timer