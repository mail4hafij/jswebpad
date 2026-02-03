/** -------------------------------------------------------------------------------------*
 * Version: 5.0                                                                           *
 * GitHub: https://github.com/mail4hafij/jswebpad                                         *
 * License: Free to use                                                                   *
 * ---------------------------------------------------------------------------------------*
 * DEVELOPED BY                                                                           *
 * Mohammad Hafijur Rahman                                                                *
 * ------------------------------------------------------------------------------------ **/

$(function () {
  // ============================================================================
  // 1. NAMESPACE INITIALIZATION
  // ============================================================================
  $.jsWebPad = $.jsWebPad || {
    version: '5.0',
    beforeSubmit: null,  // User-defined hook for form submissions
    beforeGet: null,     // User-defined hook for GET requests
    options: {
      clearForm: false,                    // Clear form fields after successful submit
      timeout: 30000,                      // Request timeout in milliseconds (30 seconds)
      showmsg: 'notifications',            // Default HTML element id for responses
      successClass: 'success',             // CSS class for success messages
      errorClass: 'error',                 // CSS class for error messages
      classesToRemove: ['notice', 'hidden'] // Classes to remove before showing messages
    }
  };

  // ============================================================================
  // 2. DEPENDENCIES CHECK
  // ============================================================================
  if (typeof $.fn.ajaxSubmit === 'undefined') {
    console.error('jsWebPad: jQuery Form plugin is required. Please include it before jswebpad.js');
    console.error('Download from: https://github.com/jquery-form/form');
    return; // Exit early
  }

  // ============================================================================
  // 3. UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Simple loader implementation
   * If user provides an element with id="ajax-loader", it will be shown/hidden
   * Otherwise, no loader is displayed
   */
  $.loader = function (action) {
    var $loader = $("#ajax-loader");
    if ($loader.length > 0) {
      if (action === "close") {
        $loader.hide();
      } else {
        $loader.show();
      }
    }
  };

  /**
   * Get a value from query string parameters given a key
   */
  function getFromQueryString(url, key) {
    if (url.indexOf("?") != -1) {
      var variables = url.split("?")[1];
      if (variables.indexOf("&") != -1) {
        // multiple parameters
        var parameters = variables.split("&");
        for (var i = 0; i < parameters.length; i++) {
          var pair = parameters[i].split("=");
          if (pair[0] == key) {
            return pair[1];
          }
        }
      } else {
        // single parameter
        var pair = variables.split("=");
        if (pair[0] == key) {
          return pair[1];
        }
      }
    }
    return null;
  }

  /**
   * Process JSON response from server
   * Handles success/error messages, HTML rendering, element visibility,
   * class manipulation, and page redirects based on server response
   */
  var showJsonResponse = function (obj) {
    try {
      if (obj.error == null) {
        // check if success message has been sent from the controller
        if (obj.success != null) {
          var opts = $.jsWebPad.options;
          var elementId = obj.showmsg || opts.showmsg;
          var $msgElement = $("#" + elementId);

          // Remove configured classes and add success class
          $msgElement.html(obj.success);
          opts.classesToRemove.forEach(function(cls) {
            $msgElement.removeClass(cls);
          });
          $msgElement.addClass(opts.successClass);
        }

        // check if html has been sent from the controller
        if (obj.html != null) {
          var opts = $.jsWebPad.options;
          var elementId = obj.showmsg || opts.showmsg;
          $("#" + elementId)
            .html(obj.html)
            .removeClass(opts.errorClass);
        }

        // check if something needs to show
        if (obj.show != null) {
          if (Array.isArray(obj.show)) {
            obj.show.forEach(function (e) {
              $("#" + e).show();
            });
          } else {
            $("#" + obj.show).show();
          }
        }

        // check if something needs to hide
        if (obj.hide != null) {
          if (Array.isArray(obj.hide)) {
            obj.hide.forEach(function (e) {
              $("#" + e).hide();
            });
          } else {
            $("#" + obj.hide).hide();
          }
        }

        // check if something needs to render
        if (obj.render != null) {
          if (Array.isArray(obj.render)) {
            obj.render.forEach(function (e) {
              $("#" + e)
                .load($("#" + e).attr("src"))
                .show();
            });
          } else {
            $("#" + obj.render)
              .load($("#" + obj.render).attr("src"))
              .show();
          }
        }

        // check if something needs to remove
        if (obj.remove != null) {
          if (Array.isArray(obj.remove)) {
            obj.remove.forEach(function (e) {
              $("#" + e).empty();
            });
          } else {
            $("#" + obj.remove).empty();
          }
        }

        // check if classes need to be added
        if (obj.addClass != null) {
          for (var elementId in obj.addClass) {
            if (obj.addClass.hasOwnProperty(elementId)) {
              var classes = obj.addClass[elementId];
              if (Array.isArray(classes)) {
                $("#" + elementId).addClass(classes.join(" "));
              } else {
                $("#" + elementId).addClass(classes);
              }
            }
          }
        }

        // check if classes need to be removed
        if (obj.removeClass != null) {
          for (var elementId in obj.removeClass) {
            if (obj.removeClass.hasOwnProperty(elementId)) {
              var classes = obj.removeClass[elementId];
              if (Array.isArray(classes)) {
                $("#" + elementId).removeClass(classes.join(" "));
              } else {
                $("#" + elementId).removeClass(classes);
              }
            }
          }
        }

        // check if classes need to be toggled
        if (obj.toggleClass != null) {
          for (var elementId in obj.toggleClass) {
            if (obj.toggleClass.hasOwnProperty(elementId)) {
              var classes = obj.toggleClass[elementId];
              if (Array.isArray(classes)) {
                $("#" + elementId).toggleClass(classes.join(" "));
              } else {
                $("#" + elementId).toggleClass(classes);
              }
            }
          }
        }

        // check if url is set or not
        if (obj.url == null) {
          // do nothing...
        } else if (obj.url == "current") {
          location.reload();
        } else {
          // check if container is set or not
          if (obj.container != null) {
            $("#" + obj.container).load(obj.url);
          } else {
            window.location = obj.url;
          }
        }
      } else {
        // error message has been sent from the controller
        var opts = $.jsWebPad.options;

        if (obj.showmsg == "alert") {
          alert(obj.error);
        } else {
          var elementId = obj.showmsg || opts.showmsg;
          var $errorTarget = $("#" + elementId);

          // Remove configured classes and add error class
          $errorTarget.html(obj.error);
          opts.classesToRemove.forEach(function(cls) {
            $errorTarget.removeClass(cls);
          });
          $errorTarget.addClass(opts.errorClass);

          // Safely scroll to error message if element exists
          if ($errorTarget.length > 0 && $errorTarget.offset()) {
            $("html, body").animate(
              {
                scrollTop: $errorTarget.offset().top - 30,
              },
              500
            );
          }
        }
      }
    } catch (e) {
      console.error('jsWebPad: Error processing response', e, obj);
    }
  };

  // ============================================================================
  // 4. CONFIGURATION
  // ============================================================================
  var options = {
    success: showJsonResponse,                // post-submit callback
    type: "post",                             // 'get' or 'post', override for form's 'method' attribute
    dataType: "json",                         // 'xml', 'script', or 'json' (expected server response type)
    resetForm: false,                         // reset the form after successful submit
    clearForm: $.jsWebPad.options.clearForm,  // clear all form fields after successful submit
    timeout: $.jsWebPad.options.timeout       // request timeout in milliseconds
  };

  // ============================================================================
  // 5. GLOBAL AJAX HANDLERS
  // ============================================================================
  $(document).ajaxSend(function (e, xhr, opt) {
    // We can add more URLs that shouldn't start the loader here...
    var showLoader = opt.url != "/Controller/Action";
    if (showLoader == true) {
      $.loader();
    }
  });

  $(document).ajaxError(function () {
    $.loader("close");
  });

  $(document).ajaxComplete(function () {
    $.loader("close");
  });

  // ============================================================================
  // 6. EVENT HANDLERS
  // ============================================================================

  // Form submit button handler
  $(document).on("click", "button[name='jsonsubmit']", function () {
    var $button = $(this);
    var $form = $(this.form);

    // Call user-defined beforeSubmit hook if exists
    // Users can implement $.jsWebPad.beforeSubmit to handle confirmations,
    // translations, validation, or any pre-submit logic
    if (typeof $.jsWebPad.beforeSubmit === 'function') {
      var result = $.jsWebPad.beforeSubmit($form, $button);
      if (result === false) {
        return false; // Cancel submission
      }
    }

    $form.ajaxSubmit(options);
    return false;
  });

  // GET link handler
  $(document).on("click", "a.get", function () {
    var $link = $(this);
    var url = $link.attr("href");
    var addClass = getFromQueryString(url, "addClass");
    if (addClass != null) {
      $link.addClass(addClass);
    }

    // Call user-defined beforeGet hook if exists
    // Users can implement $.jsWebPad.beforeGet to handle confirmations,
    // translations, validation, or any pre-request logic for GET links
    if (typeof $.jsWebPad.beforeGet === 'function') {
      var result = $.jsWebPad.beforeGet($link, url);
      if (result === false) {
        return false; // Cancel request
      }
    }

    var container = getFromQueryString(url, "container");
    // check if container is set or not
    if (container == null) {
      $.get(url, showJsonResponse);
    } else {
      $("#" + container).load(url);
    }

    return false;
  });

  // ============================================================================
  // 7. PUBLIC API
  // ============================================================================

  // For rich text editors (WidgEditor, TinyMCE, CKEditor, etc.)
  // Call this in the form's onsubmit event to sync editor content before submission
  // Usage: <form onsubmit="return $.jsWebPad.eventonsubmit('formId');">
  $.jsWebPad.eventonsubmit = function (formid) {
    var $form = $(document.forms[formid]);

    // Call user-defined beforeSubmit hook if exists
    // Note: $button is null since this is triggered by form onsubmit, not button click
    if (typeof $.jsWebPad.beforeSubmit === 'function') {
      var result = $.jsWebPad.beforeSubmit($form, null);
      if (result === false) {
        return false; // Cancel submission
      }
    }

    $form.ajaxSubmit(options);
    return false;
  };

  // ============================================================================
  // 8. BACKWARD COMPATIBILITY
  // ============================================================================
  window.eventonsubmit = $.jsWebPad.eventonsubmit;
});
