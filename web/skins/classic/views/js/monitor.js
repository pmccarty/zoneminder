function updateMonitorDimensions(element) {
  var form = element.form;
  if ( element.type == 'number' ) {
    // either width or height

    var widthFactor = parseInt(defaultAspectRatio.replace(/:.*$/, ''));
    var heightFactor = parseInt(defaultAspectRatio.replace(/^.*:/, ''));

    var monitorWidth = parseInt(form.elements['newMonitor[Width]'].value);
    var monitorHeight = parseInt(form.elements['newMonitor[Height]'].value);

    if ( form.elements['preserveAspectRatio'].checked ) {
      switch ( element.name ) {
        case 'newMonitor[Width]':
          if ( monitorWidth >= 0 ) {
            form.elements['newMonitor[Height]'].value = Math.round((monitorWidth * heightFactor) / widthFactor);
          } else {
            form.elements['newMonitor[Height]'].value = '';
          }
          monitorHeight = parseInt(form.elements['newMonitor[Height]'].value);
          break;
        case 'newMonitor[Height]':
          if ( monitorHeight >= 0 ) {
            form.elements['newMonitor[Width]'].value = Math.round((monitorHeight * widthFactor) / heightFactor);
          } else {
            form.elements['newMonitor[Width]'].value = '';
          }
          monitorWidth = parseInt(form.elements['newMonitor[Width]'].value);
          break;
      }
    }
    // If we find a matching option in the dropdown, select it or select custom

    var option = $j('select[name="dimensions_select"] option[value="'+monitorWidth+'x'+monitorHeight+'"]');
    if ( !option.size() ) {
      $j('select[name="dimensions_select"]').val('');
    } else {
      $j('select[name="dimensions_select"]').val(monitorWidth+'x'+monitorHeight);
    }
  } else {
    // For some reason we get passed the first option instead of the select
    element = form.elements['dimensions_select'];

    var value = element.options[element.selectedIndex].value;
    if ( value != '' ) { // custom dimensions
      var dimensions = value.split('x');
      form.elements['newMonitor[Width]'].value = dimensions[0];
      form.elements['newMonitor[Height]'].value = dimensions[1];
    }
  }
  return false;
}

function loadLocations( element ) {
  var form = element.form;
  var controlIdSelect = form.elements['newMonitor[ControlId]'];
  var returnLocationSelect = form.elements['newMonitor[ReturnLocation]'];

  returnLocationSelect.options.length = 1;
  //returnLocationSelect.options[0] = new Option( noneString, -1 );

  var returnLocationOptions = controlOptions[controlIdSelect.selectedIndex];
  if ( returnLocationOptions ) {
    for ( var i = 0; i < returnLocationOptions.length; i++ ) {
      returnLocationSelect.options[returnLocationSelect.options.length] = new Option( returnLocationOptions[i], i );
    }
  }
}

function initPage() {
  var backBtn = $j('#backBtn');
  var onvifBtn = $j('#onvifBtn');

  document.querySelectorAll('input[name="newMonitor[SignalCheckColour]"]').forEach(function(el) {
    el.oninput = function(event) {
      $j('#SignalCheckSwatch').css('background-color', event.target.value);
    };
  });
  document.querySelectorAll('input[name="newMonitor[WebColour]"]').forEach(function(el) {
    el.oninput = function(event) {
      $j('#WebSwatch').css('background-color', event.target.value);
    };
  });
  $j('#contentForm').submit(function(event) {
    if ( validateForm(this) ) {
      $j('#contentButtons').hide();
      return true;
    } else {
      return false;
    };
  });

  // Disable form submit on enter
  $j('#contentForm input').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if ( keyCode == 13 ) {
      e.preventDefault();
      return false;
    }
  });

  document.querySelectorAll('input[name="newMonitor[MaxFPS]"]').forEach(function(el) {
    el.oninput = el.onclick = function(e) {
      if ( e.target.value ) {
        $j('#newMonitor\\[MaxFPS\\]').show();
      } else {
        $j('#newMonitor\\[MaxFPS\\]').hide();
      }
    };
  });
  document.querySelectorAll('input[name="newMonitor[AlarmMaxFPS]"]').forEach(function(el) {
    el.oninput = el.onclick = function(e) {
      if ( e.target.value ) {
        $j('#newMonitor\\[AlarmMaxFPS\\]').show();
      } else {
        $j('#newMonitor\\[AlarmMaxFPS\\]').hide();
      }
    };
  });
  document.querySelectorAll('input[name="newMonitor[Width]"]').forEach(function(el) {
    el.oninput = window['updateMonitorDimensions'].bind(el, el);
  });
  document.querySelectorAll('input[name="newMonitor[Height]"]').forEach(function(el) {
    el.oninput = window['updateMonitorDimensions'].bind(el, el);
  });
  document.querySelectorAll('select[name="dimensions_select"]').forEach(function(el) {
    el.onchange = window['updateMonitorDimensions'].bind(el, el);
  });
  document.querySelectorAll('select[name="newMonitor[ControlId]"]').forEach(function(el) {
    el.onchange = window['loadLocations'].bind(el, el);
  });
  document.querySelectorAll('input[name="newMonitor[WebColour]"]').forEach(function(el) {
    el.onchange = window['change_WebColour'].bind(el);
  });
  document.querySelectorAll('select[name="newMonitor[Type]"]').forEach(function(el) {
    el.onchange = function() {
      var form = document.getElementById('contentForm');
      form.tab.value = 'general';
      form.submit();
    };
  });

  document.querySelectorAll('select[name="newMonitor[Function]"]').forEach(function(el) {
    el.onchange = function() {
      $j('#function_help div').hide();
      $j('#'+this.value+'Help').show();
      if ( this.value == 'Monitor' || this.value == 'None' ) {
        $j('#FunctionEnabled').hide();
      } else {
        $j('#FunctionEnabled').show();
      }
      if ( this.value == 'Record' || this.value == 'Nodect' ) {
        $j('#FunctionDecodingEnabled').show();
      } else {
        $j('#FunctionDecodingEnabled').hide();
      }
    };
    el.onchange();
  });

  $j('.chosen').chosen();

  // Don't enable the back button if there is no previous zm page to go back to
  backBtn.prop('disabled', !document.referrer.length);

  // Manage the BACK button
  document.getElementById("backBtn").addEventListener("click", function onBackClick(evt) {
    evt.preventDefault();
    window.history.back();
  });

  // Manage the REFRESH Button
  document.getElementById("refreshBtn").addEventListener("click", function onRefreshClick(evt) {
    evt.preventDefault();
    window.location.reload(true);
  });

  // Manage the PROBE button
  $j('#probeBtn').click(function(evt) {
    var mid = evt.currentTarget.getAttribute("data-mid");
    evt.preventDefault();

    //FIX-ME: MAKE THIS A MODAL
    //$j('#modalFunction-'+mid).modal('show');
    window.location.assign('?view=monitorprobe&mid='+mid);
  });

  // Manage the ONVIF button
  $j('#onvifBtn').click(function(evt) {
    var mid = evt.currentTarget.getAttribute("data-mid");
    evt.preventDefault();

    //FIX-ME: MAKE THIS A MODAL
    //$j('#modalFunction-'+mid).modal('show');
    window.location.assign('?view=onvifprobe&mid='+mid);
  });

  // Don't enable the onvif button if there is no previous zm page to go back to
  onvifBtn.prop('disabled', !hasOnvif);

  // Manage the PRESET button
  $j('#presetBtn').click(function(evt) {
    var mid = evt.currentTarget.getAttribute("data-mid");
    evt.preventDefault();

    //FIX-ME: MAKE THIS A MODAL
    //$j('#modalFunction-'+mid).modal('show');
    window.location.assign('?view=monitorpreset&mid='+mid);
  });

  // Manage the CANCEL Button
  document.getElementById("cancelBtn").addEventListener("click", function onCancelClick(evt) {
    evt.preventDefault();
    window.location.assign('?view=console');
  });

  if ( ZM_OPT_USE_GEOLOCATION ) {
    if ( window.L ) {
      var form = document.getElementById('contentForm');
      var latitude = form.elements['newMonitor[Latitude]'].value;
      var longitude = form.elements['newMonitor[Longitude]'].value;
      map = L.map('LocationMap', {
        center: L.latLng(latitude, longitude),
        zoom: 13,
        onclick: function() {
          alert('click');
        }
      });
      L.tileLayer(ZM_OPT_GEOLOCATION_TILE_PROVIDER, {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: ZM_OPT_GEOLOCATION_ACCESS_TOKEN,
      }).addTo(map);
      L.marker([latitude, longitude]).addTo(map);
    } else {
      console.log('Location turned on but leaflet not installed.');
    }
  } // end if ZM_OPT_USE_GEOLOCATION
} // end function initPage()

function change_WebColour() {
  $j('#WebSwatch').css(
      'backgroundColor',
      $j('input[name="newMonitor[WebColour]"]').val()
  );
}

function getRandomColour() {
  var letters = '0123456789ABCDEF';
  var colour = '#';
  for (var i = 0; i < 6; i++) {
    colour += letters[Math.floor(Math.random() * 16)];
  }
  return colour;
}

function random_WebColour() {
  var new_colour = getRandomColour();
  $j('input[name="newMonitor[WebColour]"]').val(new_colour);
  $j('#WebSwatch').css(
      'backgroundColor', new_colour
  );
}

function updateLatitudeAndLongitude(latitude, longitude) {
  var form = document.getElementById('contentForm');
  form.elements['newMonitor[Latitude]'].value = latitude;
  form.elements['newMonitor[Longitude]'].value = longitude;
}
function getLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      updateLatitudeAndLongitude(position.coords.latitude, position.coords.longitude);
    });
  } else {
    console.log("Geolocation not available");
  }
}

window.addEventListener('DOMContentLoaded', initPage);
