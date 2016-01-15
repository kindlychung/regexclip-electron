// todo: regex tester
// todo: regex field sync with regex tester
// todo: instruct user to provide link to firebase on first run
// todo: polish appearance (jquery ui?)

window.$ = window.jQuery = require('./bower_components/jquery/dist/jquery.min');
require("./bower_components/firebase/firebase")
const clipboard = require('electron').clipboard;


$(document).ready(function () {
    regexHub.init();
    setInterval(regexHub.executeReplace, 100);
});

var regexHub = {
    init: function () {
        var $this = this;
        $("#regex-submit").click(function (e) {
            $this.handleAddRow();
        })
        this.pushUpdate();
        //setInterval(this.executeReplace, 50)
    },
    replaceRegex: function (target, regex, replacement) {
        return target.replace(eval(regex), replacement);
    },
    executeReplace: function () {
        var self = this; // refer to the parent obj
        $("#regex-table-body tr").each(function () {
            var $this = $(this) // turn this into an jquery obj
            var isActive = Boolean($this.find("td.regex-active").html());
            if (isActive) {
                var regex_string = $this.find("td.regex-regex").html();
                var replace_string = $this.find("td.regex-replace").html();
                var clipboard_string = clipboard.readText();
                var new_string = regexHub.replaceRegex(clipboard_string, regex_string, replace_string);
                if(new_string !== clipboard_string) {
                    clipboard.writeText(new_string);
                    var notify = {
                        title: "Clipboard processed",
                        body: "Original: " + clipboard_string + "\nNew: " + new_string
                    }
                    new Notification(notify.title, notify);
                }
            }
        });
    },
    regexDB: new Firebase('https://regexclip.firebaseio.com/regex'),
    handleAddRow: function () {
        var id = $("#id-field").val();
        var regex = $("#search-field").val();
        var replace = $("#replace-field").val();
        if (id && regex && this.checkIDisUnique(id) && regex.startsWith("/")) {
            this.regexDB.push({
                id: id, regex: regex, replace: replace, active: true
            })
        } else {
            alert("First 3 fields are required.\nID must be unique.\nRegex starts with /");
        }
    },
    pushUpdate: function () {
        this.regexDB.on("child_added", function (snap) {
            var entry = snap.val();
            var entryRow = $('<tr data-id="' + entry.id + '">');
            var idCell = $('<td class="regex-id"></td>').html(entry.id);
            var regexCell = $('<td class="regex-regex"></td>').html(entry.regex);
            var replaceCell = $('<td class="regex-replace"></td>').html(entry.replace);
            var activeCell = $('<td class="regex-active"></td>').html(entry.active);
            entryRow.append(idCell).append(regexCell).append(replaceCell).append(activeCell);
            $("#regex-table-body").append(entryRow);
        })
    },
    checkIDisUnique: function (id) {
        if ($("#regex-table-body").children().length === 0) {
            return true;
        }
        var unique = true;
        $("#regex-table-body tr td:first-child").each(
            function (i, elem) {
                if (id === $(elem).html()) {
                    unique = false;
                    return false; // early break from each
                }
            }
        );
        return unique;
    }
};