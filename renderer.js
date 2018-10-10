// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var sql = require('mssql/msnodesqlv8');

window.$ = window.jQuery = require('jquery');
var config = {
  driver: 'msnodesqlv8',
  connectionString: 'Driver={SQL Server Native Client 11.0};Server={localhost\\TYONOHJAUSDB};Database={tyonohjausdb};Trusted_Connection={yes};',
};

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

Date.prototype.toDateInputValuePreviousWeek = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset() - 7 * 24 * 60);
    return local.toJSON().slice(0,10);
});



var firstDay = new Date().toDateInputValue();

var previousweek = Date.now() - 7 * 24 * 60 * 60;
var parsed_previousweek = new Date(previousweek).toDateInputValuePreviousWeek();
$('#lopetuspvm').val(firstDay);
$('#aloituspvm').val(parsed_previousweek);
$('#lopetuspvm, #aloituspvm').change(function(e) {
  let pvm = Date.parse($(e.target).val());
  if (new Date(1000,0) < pvm) {
    getData();
  }
});
  sql.connect(config)
  .then(function() {
   // create Request object
        getData();
  })
  .catch(function(err) {
    console.log(err);
    // ... connect error checks
  });

var getData = function() {
  var request = new sql.Request();
  var lopetuspvm = new Date($('#lopetuspvm').val());
  var aloituspvm = new Date($('#aloituspvm').val());
  request.input("lopetus", sql.DateTime, lopetuspvm);
  request.input("aloitus", sql.DateTime, aloituspvm);
  // query to the database and get the records
  request.query('SELECT * FROM valmiit WHERE Valmistumisaika BETWEEN @aloitus AND @lopetus', function (err, recordset) {
    if (err) {
      console.log(err)
    } else {
      if (recordset && recordset['recordset']) {
        var nollat = [];
        var automaatti = [];
        var kasikoppi = [];

        recordset['recordset'].forEach(function(entry) {
          console.log(entry);
          if (entry['Maara'] == 0) {
            nollat.push(entry);
          }
        });

        $('#nollat').html(nollat.length);
        $('#total').html(recordset['recordset'].length);
        $('#maalatut').html(recordset['recordset'].length - nollat.length);
      }
    }
  });
};
