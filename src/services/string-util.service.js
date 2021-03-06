(function() {
    'use strict';

    angular.module('app')
        .service('StringUtil', function() {
            return {
                // Capitalises each specie name and replaces 'not_on_list' with 'Other'
                cleanAndCapitalise: function (str) {
                    if (str == "not_on_list"){
                        str = "Other";
                    } else {
                        str = str.split('_')
                                .map(x => x.substring(0,1).toUpperCase()+x.substring(1))
                                .join(' ');
                    }
                    return str;
                },

                capitalise: function(str, separator = " ") {
                    return str.split(separator)
                            .map(x => x.substring(0,1).toUpperCase()+x.substring(1))
                            .join(' ');
                },

                // Sorts the items according to species pushing "Other"
                // to the end of the list
                otherAtEndcomparator: function (a, b) {
                    if(a == "Other" || a > b) {
                        return 1;
                    }else if(b == "Other" || a < b){
                        return -1;
                    }
                    return 0;
                },
            }
        });

})();
