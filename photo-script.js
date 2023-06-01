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

if (navigator.clipboard) {

  console.log('Clipboard API available');

}

//Get Order Notes
$('#order-id').change(function(){

  var orderID = $('#order-id').val();

  currentOrderID = $('#order-id').val();
  currentTech = $('#initials').val();

  $('#order-notes').html("Retrieving Order Notes");
  $('#last-name').val("");
  $('#last-name').attr("placeholder", "Retrieving Customer Name");
  getOrderDetails(currentOrderID, currentTech);
})


//-----------------------------------------------------------------
//~~~~~~~~~~~~~~~~~~~~~~~~~Form Submission~~~~~~~~~~~~~~~~~~~~~~~~~
//-----------------------------------------------------------------

var orderID;
var lastName;
var photoType;
var numPhotos;
var photoGroup;
var initials;
var qcNotes;
var checkOrderStatus = false;

function getFormDetails(){

  orderID = $('#order-id').val();
  lastName = $('#last-name').val();
  photoType = $('#photo-type').val();
  photoTypeText = $('#photo-type option:selected').text();
  numPhotos = $('#scans').val();
  initials = $('#initials').val();
  photoGroup = $('#photo-group').val();
  qcNotes = $('#qc-notes').val();

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
      title: 'Ready to Log ' + numPhotos + ' ' + photoType + ' <br/> For ' + orderID + '_' + lastName + '?',
      text: 'Ready to Log Photos?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Log Photos',
      returnFocus: false,
      focusCancel: true
    }).then((result) => {
      if (result.isConfirmed) {
        logPhotos()
      }
    })

});

function logPhotos(){

  spinner.show();

  getFormDetails();

  var params = new URLSearchParams({
    orderID: orderID,
    lastName: lastName,
    photoType: photoType,
    initials: initials,
    photoGroup: photoGroup,
    numPhotos: numPhotos,
    qcNotes: qcNotes,
    orderCategory: "photo",
    getOrderDetails: false
  });

  console.log(orderID);


  fetch(scriptURLC, {
          method: 'POST',
          body: params
      })
      .then(res => {

          console.log(res);
          spinner.hide();

          res.json().then(function(data) {
            console.log(data);

            if (res['status'] == 200) {

                if(data.errorTitle == ""){
                  Swal.fire({
                    title: "Photos Logged!",
                    html: numPhotos + " " + photoTypeText + " For Order " + orderID + "_" + $("#last-name").val() + " Have Been Logged!",
                    icon: "success",
                    returnFocus: false
                  }).then((result) => {
                    if (result.isConfirmed) {
                      $('#order-id').val(orderID);
                      $('#scans').val("");
                      $("#photo-type").val("").change();
                      $("#photo-group").val("");
                      $("#qc-notes").val("");
                      $('#scans').focus();
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
                Swal.fire("Something went wrong!", "Review Customer Log and/or contact Admin<br/>" + orderID + "<br/>" + numPhotos + "<br/>" + photoType + "<br/>", "error");

            }

          });



          document.getElementById('submitForm').classList.remove('loading');

      })
      .catch(error => {
          spinner.hide();
          // document.getElementById('submitForm').classList.remove('loading');
          Swal.fire("Something went wrong!", "Review Customer Log and/or contact Admin", "error");
          // todo enable submit button

      })
}

function getOrderDetails(orderID, initials){

  $("#submit-button").attr("disabled", true);

  getFormDetails();

  var params = new URLSearchParams({
    orderID: orderID,
    initials: initials,
    checkOrderStatus: checkOrderStatus,
    getOrderDetails: true
  });

    fetch(scriptURLC, {

      method: 'POST',
      body: params

    }).then(response => response.json())
    .then(data => {

      $("#order-notes").html('<a href="' + data.orderURL + '" target="_blank">Link to File Log</a>' + '</br>' + data.orderNotes);
      $("#last-name").val(data.customerName);

      $('#last-name').attr("placeholder", "Smith");

      $('#scans').focus();

      $('#submit-button').attr("disabled", false);
      console.log(data)
    });



}
