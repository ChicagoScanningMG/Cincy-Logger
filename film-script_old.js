var spinner = $('#loader');
const scriptURLC ='https://script.google.com/macros/s/AKfycbxZNsBKYnmDgc5q3GujKw-0cnmKdbG-hruyz8s459yd6e07AGdZGAUGs21UOMGt3iXO/exec';
// const scriptURLC ='turd';
const serverlessForm = document.forms['serverless-form'];
var timerOn = false;
var bgAnimate = false;

$("#reset-btn").click(function(){
  $("#contactForm").trigger("reset");
  $(".pulled-detail").html("");
  resetTimer();
});

var countdownDuration = 10 * 60 * 1000;

// $("#restart-button").click(function(){
//
//   console.log("restart button Clicked");
//   countdownDuration = 10 * 60 * 1000;
//   $("#stop-timer").html("10:00");
//   if (timerOn == false){
//
//     timerOn = true;
//     runTimer();
//
//   }
//   $("body").css({"animation-name":"", "animation-duration":"", "animation-iteration-count":""})
//
// })

// function resetTimer(){
//
//   timerOn = false;
//   bgAnimate = false;
//   $("body").css({"animation-name":"", "animation-duration":"", "animation-iteration-count":""})
//   $("#stop-timer-button").css("display", "");
//   $("#stop-timer-div").css("display", "none");
//   $("body").css("background-color", "black");
//   // clearInterval(timer);
//   countdownDuration = 10 * 60 * 1000;
//
// }

// $("#stop-timer-button").click(function(){
//
//   runTimer();
//
// })

// function runTimer(){
//
//   console.log("stop timer button clicked");
//   timerOn = true;
//   $("#stop-timer-button").css("display", "none");
//   $("#stop-timer-div").css("display", "inherit");
//   $("#stop-timer").css("width", $("#stop-timer").width());
//
//
//   var now = new Date().getTime();
//   var countdownTime = now + countdownDuration;
//
//   console.log("Countdown Duration: " + countdownDuration);
//   console.log("current Time: " + now);
//   console.log("Countdown Time: " + countdownTime);
//
//   var timer = setInterval(function(){
//     console.log("Tick");
//
//     var now = new Date().getTime();
//
//     var distance = (now + countdownDuration) - now;
//     console.log("countdownTime: " + countdownTime);
//
//     var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//     var seconds = Math.floor((distance % (1000 * 60)) / 1000);
//     if (seconds < 10) seconds = "0" + seconds;
//
//     $("#stop-timer").html(minutes + ":" + seconds);
//
//     countdownDuration = countdownDuration - 1000;
//
//     // If the count down is finished, write some text
//     if (distance <= 0) {
//       clearInterval(timer);
//       countdownDuration = 10 * 60 * 1000;
//       timerOn = false;
//       bgAnimate = true;
//
//       $("body").css({"animation-name":"doneFlash", "animation-duration":"1.6s", "animation-iteration-count":"infinite"})
//
//     }
//
//     if (timerOn == false) {
//       clearInterval(timer);
//       countdownDuration = 10 * 60 * 1000;
//     }
//
//   }, 1000);
//
// }

$("#order-id").change(function(){

  var orderID = $('#order-id').val();
  var reelName = orderID.split("_");

  if (reelName.length > 1){

    $('#order-id').val(reelName[0]);
    $('#last-name').val(reelName[1]);
    $('#reel-num').val(reelName[2]);
    $('#reel-num').focus();

  }



})

//Get Order Notes
$('#order-id').change(function(){
  $('#order-notes').html("Retrieving Order Notes");
  $('#last-name').val("");
  $('#last-name').attr("placeholder", "Retrieving Customer Name");
  getOrderDetails($('#order-id').val(), $('#reel-num').val());
})

//Get Reel notes - Do I even want this for film reels?  We don't usually leave notes
// $('#reel-num').change(function(){
//   $('#existing-qc-notes').html("Retrieving Tape Notes");
//   getOrderDetails($('#order-id').val(), $('#reel-num').val());
// })





serverlessForm.addEventListener('submit', e => {
    e.preventDefault();

    var orderID = $('#order-id').val();
    var lastName = $('#last-name').val();
    var reelNum = $('#reel-num').val();
    var footage = $('#footage').val();
    var sound = $('#sound').val();
    var qcNotes = $('#qc-notes').val();
    var billingNotes = $('#billing-notes').val();

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
        // Swal.fire('Saved!', '', 'success')
        logFilm(e)
      }
    })

});

function logFilm(e){

  spinner.show();

  var orderID = $('#order-id').val();
  var lastName = $('#last-name').val();
  var reelNum = $('#reel-num').val();
  var footage = $('#footage').val();
  var sound = $('#sound').val();
  var qcNotes = $('#qc-notes').val();
  var billingNotes = $('#billing-notes').val();

  console.log(orderID);

  var filmProgress = "";

  fetch(scriptURLC, {
          method: 'POST',
          body: new FormData(serverlessForm)
      })
      .then(res => {

          console.log(res);
          spinner.hide();

          res.json().then(function(data) {
            console.log(data);
            filmProgress = data.filmProgress;

            if (res['status'] == 200) {

                if(data.errorTitle == ""){
                  Swal.fire({
                    title: "Film Logged!",
                    html: "Reel #" + reelNum + " For Order " + orderID + "_" + $("#last-name").val() + " Has Been Logged!" + "<br/>" + data.filmProgress,
                    icon: "success",
                    returnFocus: false
                  }).then((result) => {
                    if (result.isConfirmed) {
                      // Swal.fire('Saved!', '', 'success')
                      // $(".resetAble").val("");
                      resetTimer();
                      $('#order-id').val(orderID);
                      $('#stop-time').val("")
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

function getOrderDetails(orderID, reelNum){

  const params = new URLSearchParams({
    orderID: orderID,
    reelNum: reelNum,
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
      $("#order-notes").html(data.orderNotes);
      $("#last-name").val(data.customerName);

      copyToClipboard($('#order-id').val() + "_" + $('#last-name').val() + "_" + ('000' + $('#reel-num').val()).slice(-3))

      $('#last-name').attr("placeholder", "Smith");

      if ($('#reel-num').val() == "") {
        $('#reel-num').focus();
      } else if ($("#initials").val() == "") {
        $('#initials').focus();
      } else {
        $('#qc-notes').focus();
      }

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
