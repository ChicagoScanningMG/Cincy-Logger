var spinner = $('#loader');
const scriptURLC ='https://script.google.com/macros/s/AKfycbwTwJyXqeZpEwcWRiG3CJHhOnsoS532VNplqSAA6pAEpaEomQZcTBemYOCRAQSlABqZXQ/exec';
const serverlessForm = document.forms['serverless-form'];
var timerOn = false;
var bgAnimate = false;
var oldOrderID = 0000;
var currentOrderID = 0000;
var oldTech = "";
var currentTech = "";

$("#reset-btn").click(function(){
  $("#contactForm").trigger("reset");
  $(".pulled-detail").html("");
});

var countdownDuration = 10 * 60 * 1000;

if (navigator.clipboard) {

  console.log('Clipboard API available');

}

//Get Order Notes
$('#order-id').change(function(){

  var orderID = $('#order-id').val();
  var reelName = orderID.split("_");

  if (reelName.length > 1){

    $('#order-id').val(reelName[0]);
    $('#last-name').val(reelName[1]);
    $('#reel-num').val(reelName[2]);
    $('#reel-num').focus();

  }

  currentOrderID = $('#order-id').val();
  currentTech = $('#initials').val();

  $('#order-notes').html("Retrieving Order Notes");
  $('#last-name').val("");
  $('#last-name').attr("placeholder", "Retrieving Customer Name");
  getOrderDetails(currentOrderID, $('#reel-num').val(), currentTech);
})

//Get Reel notes
$('#reel-num').change(function(){

  currentOrderID = $('#order-id').val();
  currentTech = $('#initials').val();

  $('#existing-qc-notes').html("Retrieving Tape Notes");
  getOrderDetails(currentOrderID, $('#reel-num').val(), currentTech);
})

//If the initials have been updated, update order Status on Order Tracking.
$('#initials').change(function(){

  currentOrderID = $('#order-id').val();
  currentTech = $('#initials').val();

  getOrderDetails(currentOrderID, $('#reel-num').val(), currentTech);

})

//If Reel is unbillable, do not require footage count
$('#billing-notes').change(function(){

  if ($('#billing-notes').val() == "Blank Tape"){

    $('#footage').attr("required", false);

  } else {

    $('#footage').attr("required", true);

  }

})

//-----------------------------------------------------------------
//~~~~~~~~~~~~~~~~~~~~~~~~~Form Submission~~~~~~~~~~~~~~~~~~~~~~~~~
//-----------------------------------------------------------------

var orderID;
var lastName;
var reelNum;
var footage;
var initials;
var sound;
var qcNotes;
var needsReview;
var notesOnly;
var billingNotes;
var checkOrderStatus = false;

function getFormDetails(){

  orderID = $('#order-id').val();
  lastName = $('#last-name').val();
  reelNum = $('#reel-num').val();
  footage = $('#footage').val();
  initials = $('#initials').val();
  sound = $('#sound').is(":checked");
  qcNotes = $('#qc-notes').val();
  needsReview = $('#needs-review').is(":checked");
  notesOnly = $('#notes-only').is(":checked");
  billingNotes = $('#billing-notes').val();

  if (currentOrderID != oldOrderID || currentTech != oldTech){

    checkOrderStatus = true;
    oldOrderID = currentOrderID;
    oldTech = currentTech;

  } else {

    checkOrderStatus = false;

  }

}

serverlessForm.addEventListener('submit', e => {
    e.preventDefault();

    getFormDetails();

    Swal.fire({
      title: 'Ready to Log Film <br/>' + orderID + '_' + lastName + '_ ' + reelNum + '?',
      text: 'Ready to Log Film?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Log Film',
      returnFocus: false,
      focusCancel: true
    }).then((result) => {
      if (result.isConfirmed) {
        logFilm()
      }
    })

});

function logFilm(){

  spinner.show();

  getFormDetails();

  var params = new URLSearchParams({
    orderID: orderID,
    lastName: lastName,
    tapeNum: reelNum,
    footage: footage,
    initials: initials,
    qcNotes: qcNotes,
    needsReview: needsReview,
    notesOnly: notesOnly,
    billingNotes: billingNotes,
    sound: sound,
    orderCategory: "film",
    getOrderDetails: false
  });

  console.log(orderID);

  var filmProgress = "";

  fetch(scriptURLC, {
          method: 'POST',
          body: params
      })
      .then(res => {

          console.log(res);
          spinner.hide();

          res.json().then(function(data) {
            console.log(data);
            orderProgress = data.tapeProgress;

            if (res['status'] == 200) {

                if(data.errorTitle == ""){
                  Swal.fire({
                    title: "Film Logged!",
                    html: "Reel #" + reelNum + " For Order " + orderID + "_" + $("#last-name").val() + " Has Been Logged!" + "<br/>" + orderProgress,
                    icon: "success",
                    returnFocus: false
                  }).then((result) => {
                    if (result.isConfirmed) {
                      $('#order-id').val(orderID);
                      $('#reel-num').val("");
                      $('#footage').val("");
                      $('#qc-notes').val("");
                      $("#billing-notes").val("").change();
                      $('#needs-review').prop('checked', false);
                      $('#sound').prop('checked', false);
                      $('#notes-only').prop('checked', false);
                      $('#existing-qc-notes').html("");
                      $('#reel-num').focus();
                    }
                  });
                } else { //There was a logging error

                  Swal.fire({
                    title: data.errorTitle,
                    html: data.errorText,
                    icon: "error",
                    returnFocus: false
                  });

                }

                return true;

            } else {
                Swal.fire("Something went wrong!", "Review Footage Log and/or contact Admin<br/>" + orderID + "<br/>" + reelNum + "<br/>" + qcNotes + "<br/>" + billingNotes, "error");

            }

          });



          document.getElementById('submitForm').classList.remove('loading');

      })
      .catch(error => {
          spinner.hide();
          // document.getElementById('submitForm').classList.remove('loading');
          Swal.fire("Something went wrong!", "Review Footage Log and/or contact Admin", "error");
          // todo enable submit button

      })
}

function getOrderDetails(orderID, reelNum, initials){

  $("#submit-button").attr("disabled", true);

  if (isNaN(reelNum)) {

    var parsedReel = reelNum.split(/[,-]/);
    reelNum = parsedReel[0];

  }

  getFormDetails();

  var params = new URLSearchParams({
    orderID: orderID,
    tapeNum: reelNum,
    initials: initials,
    checkOrderStatus: checkOrderStatus,
    getOrderDetails: true
  });

    fetch(scriptURLC, {

      method: 'POST',
      body: params

    }).then(response => response.json())
    .then(data => {

      var splitNotes = data.tapeNotes.split("\n\n");
      console.log(splitNotes);
      var formattedNotes = "";

      if (splitNotes.length > 1){

        splitNotes.forEach(line => formattedNotes = formattedNotes + line + "<br/>");

      } else {

        formattedNotes = data.tapeNotes;

      }

      $("#existing-qc-notes").html(formattedNotes);
      $("#order-notes").html('<a href="' + data.orderURL + '" target="_blank">Link to File Log</a>' + '</br>' + data.orderNotes);
      $("#last-name").val(data.customerName);

      navigator.clipboard.writeText($('#order-id').val() + "_" + $('#last-name').val() + "_" + ('000' + $('#reel-num').val()).slice(-3));

      $('#last-name').attr("placeholder", "Smith");

      if ($('#reel-num').val() == "") {
        $('#reel-num').focus();
      } else if ($("#initials").val() == "") {
        $('#initials').focus();
      } else {
        $('#footage').focus();
      }
      $('#submit-button').attr("disabled", false);
      console.log(data)
    });



}

function copyToClipboard(value) {
  var tempInput = document.createElement("input");
  tempInput.value = value;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}
