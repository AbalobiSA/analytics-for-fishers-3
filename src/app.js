(function () {

    let app = angular
        .module('app', ['ionic', 'auth0.auth0', 'angular-jwt', '720kb.tooltips']);
    
        // .config(config);

    // config.$inject = ['$stateProvider', '$urlRouterProvider', 'angularAuth0Provider', '$httpProvider'];

    app.filter('capitalizeKeys', function() {
        return function(input) {
            return (!!input) ? input.split('_').map(w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()).join(' ') : '';
        }
    });

    app.filter('costKeysTranslator', function() {
        const costTypeMap = {
            'bait': 'ass',
            'fuel': 'brandstof',
            'food': 'voedsel',
            'harbour_fee': 'hawe_fooi',
            'oil' : 'olie',
            'other': 'ander',
            'transport': 'transport',
        }

        return function(input, a) {
            return costTypeMap[input] || input;
        }
    })

    app.filter('quantitiesKeysFilter', function() {
        const allowedTypes = [
            'crates', 'sold_crates',
            'items', 'sold_items',
            'weight_kg', 'sold_kg',
        ]

        return function (quantities) {
            console.log('qkf -> ', quantities);
            let out = {}

            for (key in quantities) {
                if (allowedTypes.indexOf(key) > 1){
                    out[key] = quantities[key];
                }
            }
            return out;
        }
    })

    app.filter('quantitiesKeysTranslator', function() {
        const incomeTypeMap = {
            'crates' : 'kratte (totale)',
            'sold_crates' : 'kratte (verkoop)',
            'items' : 'totale (totale)',
            'sold_items' : 'totale (verkoop)',
            'weight_kg' : 'kg (totale)',
            'sold_kg' : 'kg (verkoop)'
        }

        return function (key) {
            return (incomeTypeMap[key]||key);
        }
    })

    app.filter('quantitiesValueSymbol', function() {
        const incomeTypeMap = {
            // 'items' : ' vis',
            // 'sold_items' : ' vis',
            'weight_kg' : ' kg',
            'sold_kg' : ' kg'
        }

        return function (val, key) {
            return val + (incomeTypeMap[key]|| '');
        }
    })

    app.filter('quantitiesIncome', function() {
        return function (quantities) {
            // console.log('quant income', quantities, typeof quantities);
            let total = 0;
            for (key in quantities) {
                // console.log('quant income2', key, typeof key);
                if (key.startsWith('income_') || key == 'price_batch'){
                    total += quantities[key];
                }
            }
            return total;
        }
    })

    app.filter('speciesNameMapper', function() {
        let availableLangs = ['eng', 'afr'];
        return function (species, list, lang) {
            // console.log('s name mapper', species, list, lang);
            if (availableLangs.indexOf(lang) < 0){
                lang = 'eng';
            }
            
            return list[species][lang] || list['not_on_list'].lang;
        }
    })

    app.filter('speciesImageMapper', function() {
        return function (species, list) {
            // console.log('s name mapper', species, list);
            // let img = list[species].img;
            // console.log(img);
            return list[species].img;
        }
    })


})();



