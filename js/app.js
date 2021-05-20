
// Költségvetés vezérlő

var budgetController = (function () {

    var Kiadas = function (id, title, value) {
        this.id = id;
        this.title = title;
        this.value = value;

    };


    var Bevetel = function (id, title, value) {
        this.id = id;
        this.title = title;
        this.value = value;

    };


    var datum = function () {
        var date, month, actualMonth
        date = new Date();
        month = date.getMonth() + 1;

        switch (month) {
            case 1:
                actualMonth = "január"
                break;
            case 2:
                actualMonth = "február"
                break;
            case 3:
                actualMonth = "március"
                break;
            case 4:
                actualMonth = "április"
                break;
            case 5:
                actualMonth = "május"
                break;
            case 6:
                actualMonth = "június"
                break;
            case 7:
                actualMonth = "július"
                break;
            case 8:
                actualMonth = "augusztus"
                break;
            case 9:
                actualMonth = "szeptember"
                break;
            case 10:
                actualMonth = "október"
                break;
            case 11:
                actualMonth = "november"
                break;
            case 12:
                actualMonth = "december"
                break;
        }
        return actualMonth;
    };


    var vegosszegSzamolas = function (type) {
        var osszeg = 0;
        datas.tetelek[type].forEach((actual) => {
            osszeg += actual.value;
        })
        datas.osszegek[type] = osszeg;

    }


    var datas = {

        tetelek: {

            bevetel: [],
            kiadas: []
        },

        osszegek: {

            bevetel: 0,
            kiadas: 0
        },

        koltsegvetes: 0,

        szazalek: -1,

        honap: [
            datum()
        ]

    };


    return {

        aktualisHonap: function () {
            return datum()
        },

        tetelHozzaad: function (type, title, value) {
            var ujTetel, id;
            id = 0;


            //id létrehozása
            if (datas.tetelek[type].length > 0) {
                id = datas.tetelek[type][datas.tetelek[type].length - 1].id + 1;

            } else {
                id = 0;
            }


            // új kiadás vagy bevétel létrehozás
            if (type === 'bevetel') {
                ujTetel = new Bevetel(id, title, value)
            } else if (type === "kiadas") {
                ujTetel = new Kiadas(id, title, value)
            }


            // új tétel hozzáadása az adatszerkezethez
            datas.tetelek[type].push(ujTetel);

            // új tétel visszaadása
            return ujTetel;
        },


        teteTorol: function (type, id) {
            var idTomb, index;
            idTomb = datas.tetelek[type].map(function (actual) {
                return actual.id
            });

            index = idTomb.indexOf(id);
            if (index !== -1) {
                datas.tetelek[type].splice(index, 1);
            }

        },

        tetelModosit: function (type, id, title, value) {
            var idTomb, index;
            idTomb = datas.tetelek[type].map(function (actual) {
                return actual.id
            });

            index = idTomb.indexOf(id);



            if (index !== -1) {


                datas.tetelek[type][index].title = title;
                datas.tetelek[type][index].value = parseInt(value);
            }

        },

        koltsegvetesSzamolas: function () {

            // összes bevétel és kiadás számolása
            vegosszegSzamolas('bevetel');
            vegosszegSzamolas('kiadas');

            // ktg vetés kiszámítása
            datas.koltsegvetes = datas.osszegek.bevetel - datas.osszegek.kiadas;


            // százalék számolása

            if (datas.osszegek.bevetel > 0) {
                datas.szazalek = Math.round((datas.osszegek.kiadas / datas.osszegek.bevetel) * 100);

            } else {
                datas.szazalek = -1;
            }
        },

        getKoltsegvetes: function () {
            return {
                koltsegvetes: datas.koltsegvetes,
                osszesBevetel: datas.osszegek.bevetel,
                osszesKiadas: datas.osszegek.kiadas,
                szazalek: datas.szazalek,
            }
        },

        getDatas: function () {
            return datas
        },

        teszt: function () {
            console.log(datas)
        }
    }

})();



// Felület vezérlő

var surfaceController = (function () {

    const formatter = new Intl.NumberFormat('hu', {
        style: 'currency',
        currency: 'HUF',
        minimumFractionDigits: 0
    });


    var DOMelements = {
        inputType: '.hozzaad__tipus',
        inputTitle: '.hozzaad__leiras',
        inputValue: '.hozzaad__ertek',
        inputButton: '.hozzaad__gomb',
        bevetelekWrapper: '.bevetelek__lista',
        kiadasokWrapper: '.kiadasok__lista',
        koltsegvetesCimke: '.koltsegvetes__ertek',
        osszesBevetelCimke: '.koltsegvetes__bevetelek--ertek',
        osszesKiadasCimke: '.koltsegvetes__kiadasok--ertek',
        szazalekCimke: '.koltsegvetes__kiadasok--szazalek',
        kontener: '.bottom',
        tetel: '.tetel',
        selected: '.selected-wrapper',
        tetelLeiras: '.tetel__leiras',
        tetelErtekWrapper: '.tetel__ertek-wrapper',
        tetelErtek: '.tetel__ertek--wrapper',
        clickedTitleInput: '.selected-item.title',
        clickedValueInput: '.selected-item.value',
        modal: '.modal',
        modalBtn: '.new-month',
        modalClose: '.modal-close',
        modalSelect: '.modal-select',
        modalAccept: '.modal-accept',
        month: '.months',
        monthsOption: '.months-option',

    };

    return {
        getInput: function () {


            return {
                type: document.querySelector(DOMelements.inputType).value,
                title: document.querySelector(DOMelements.inputTitle).value,
                value: parseInt(document.querySelector(DOMelements.inputValue).value),
            }

        },

        getDOMelements: function () {
            return DOMelements;
        },


        tetelMegjelenites: function (object, type) {
            var html, ujHtml, elem;
            // html megírása

            if (type === 'bevetel') {
                elem = DOMelements.bevetelekWrapper;

                /*bevétel*/  html = `
                                    <div class="tetel clearfix" id="bevetel-%id%">
                                        <div class="tetel__leiras">%leiras%</div>
                                        <div class="tetel__ertek-wrapper right clearfix">
                                            <div class="tetel__ertek">%ertek%</div>                                         
                                        </div>
                                        <div class="selected-wrapper hide ">
                                            <input value="%title%" class="selected-item title"></input>
                                            <input type="number" value="%value%" class="selected-item value"></input>
                                            <button class="button modify"><i class="fas fa-check-circle"></i></button>
                                            <button class="button cancel"><i class="fas fa-trash-alt"></i></button>
                                            <button class="button delete"><i class="fas fa-times-circle"></i></button>
                                        </div>
                                    </div>
                                    `;


            } else if (type === "kiadas") {
                elem = DOMelements.kiadasokWrapper;


                /*kiadás*/   html = `
                                <div class="tetel clearfix" id="kiadas-%id%">
                                    <div class="tetel__leiras">%leiras%</div>
                                    <div class="tetel__ertek-wrapper right clearfix">
                                        <div class="tetel__ertek">%ertek%</div>
                                    </div>
                                    <div class="selected-wrapper hide ">
                                        <input value="%title%" class="selected-item title active"></input>
                                        <input type="number" value="%value%" class="selected-item value active"></input>
                                        <button class="button modify"><i class="fas fa-check-circle"></i></button>
                                        <button class="button cancel"><i class="fas fa-trash-alt"></i></button>
                                        <button class="button delete"><i class="fas fa-times-circle"></i></button>
                                    </div>
                                </div>
                                `;
            }


            // html feltöltése adatokkal

            ujHtml = html.replace("%id%", object.id);
            ujHtml = ujHtml.replace("%leiras%", object.title);
            ujHtml = ujHtml.replace("%ertek%", formatter.format(object.value));
            ujHtml = ujHtml.replace("%title%", object.title);
            ujHtml = ujHtml.replace("%value%", object.value);


            // html megjelenítése, hozzáadása dom-hoz
            document.querySelector(elem).insertAdjacentHTML("beforeend", ujHtml);
        },

        tetelTorles: function (tetelId) {
            var elem = document.getElementById(tetelId);
            elem.parentNode.removeChild(elem);
        },

        urlapTorles: function () {
            var inputMezok, inputMezokTomb;
            inputMezok = document.querySelectorAll(DOMelements.inputTitle + ', ' + DOMelements.inputValue);
            inputMezokTomb = Array.prototype.slice.call(inputMezok);

            inputMezokTomb.forEach((current) => {
                current.value = "";
            });
            inputMezokTomb[0].focus();
        },



        ktgMegjelenites: function (object) {



            document.querySelector(DOMelements.koltsegvetesCimke).textContent = formatter.format(object.koltsegvetes);
            document.querySelector(DOMelements.osszesBevetelCimke).textContent = formatter.format(object.osszesBevetel);
            document.querySelector(DOMelements.osszesKiadasCimke).textContent = formatter.format(object.osszesKiadas);
            if (object.szazalek > 0) {

                document.querySelector(DOMelements.szazalekCimke).textContent = object.szazalek + '%';
            } else {
                document.querySelector(DOMelements.szazalekCimke).textContent = '-';

            }
        },
        // select input
        aktualisHonapMegjelenites: function () {
            /*       var select, datas, selectedOption;
      
                  select = document.querySelector(DOMelements.month);
                  datas = budgetController.getDatas();
                  option = document.querySelectorAll(DOMelements.monthsOption);
                  for(let i =0;i<option.length;i++){
                      selectedOption = (Array.from(option).filter(f => f.value === datas.honap[i]));
                      selectedOption[i].setAttribute('selected', '');
                  } */
        }
    }
})();




var osszegFrissitese = function () {
    //5.1 költségvetés újraszámolás
    budgetController.koltsegvetesSzamolas();

    //5.2 Összeg visszaadása
    var koltsegvetes = budgetController.getKoltsegvetes();


    //5.3 Össszeg megjelenítése a felületen
    surfaceController.ktgMegjelenites(koltsegvetes)

}




// Alkalmazás vezérlő
var mainController = (function (budgetController, surfaceController) {




    /* 
        var createOption = function () {
            var dom, select, option, options, datas, proba;
            datas = budgetController.getDatas();
            dom = surfaceController.getDOMelements();
            select = document.querySelector(dom.month);
    
    
    
            if (select.children.length < 1) {
                option = document.createElement('option');
                option.setAttribute('class', 'months-option')
                option.setAttribute('value', budgetController.aktualisHonap());
                option.innerHTML = budgetController.aktualisHonap();
                select.appendChild(option);
              
            }
        } */


    var esemenykezelokBeallit = function () {

        var DOM = surfaceController.getDOMelements();

        document.querySelector(DOM.inputButton).addEventListener('click', addItem);

        document.addEventListener('keydown', function (event) {
            if (event.key !== undefined && event.key === 'Enter') {
                addItem();
            }
            else if (event.keyCode !== undefined && event.keyCode === 13) {
                addItem();
            }

        });

        document.querySelector(DOM.kontener).addEventListener('click', onClick);

        /*   document.querySelector(DOM.modalBtn).addEventListener('click', modalFnc);  */




    }

    var addItem = function () {

        var input, ujTetel;
        // 1. bevitt adatok megszerzése
        input = surfaceController.getInput();

        if (input.title.trim('') !== "" && !isNaN(input.value) && input.value > 0) {



            // 2. adatok átadása a ktg vezérlő modulnak
            ujTetel = budgetController.tetelHozzaad(input.type, input.title, input.value);

            // 3. Mezők törlése
            surfaceController.urlapTorles();

            // 4. megjelenítés a felületen
            surfaceController.tetelMegjelenites(ujTetel, input.type);


            //5 ktg újraszámolása és frissítése a felületen
            osszegFrissitese();
        }

        else {
            var dom, modal, datas, heading;
            dom = surfaceController.getDOMelements();
            datas = budgetController.getDatas();
            modal = document.querySelector(dom.modal);
            heading = modal.children[0].children[1];

            modal.style.display = "block";

            document.querySelector(dom.modalClose).addEventListener('click', () => {

                modal.style.display = "none";
            })
        }

        if (isNaN(input.value)) {
            heading.textContent = "Kérem töltse ki az Érték mezőt!"
        }

        if (input.value < 0) {
            heading.textContent = "Az érték mezőnek 0-nál nagyobbnak kell lennie.";
        }

        if (input.title.trim('') === "") {
            heading.textContent = "Kérem töltse ki a Leírás mezőt!";
        }

        if (isNaN(input.value) && input.title.trim('') === "") {

            heading.textContent = "Kérem töltse ki a Leírás és érték mezőt!";
        }

    }

    var onClick = function (event) {

        var dom = surfaceController.getDOMelements();
        var tetelek = document.querySelectorAll(dom.tetel);


        function frissites() {
            for (let i = 0; i < tetelek.length; i++) {
                tetelek[i].children[0].classList.remove('hide');
                tetelek[i].children[1].classList.remove('hide');
                tetelek[i].children[2].classList.add('hide');
            }
        }

        // Kattintás a tételek között
        if (event.target.className === "tetel clearfix") {
            frissites()
            event.target.children[0].classList.add('hide');
            event.target.children[1].classList.add('hide');
            event.target.children[2].classList.remove('hide');
        }

        //Kattintás a törlés gombra
        if (event.target.className === "fas fa-trash-alt") {

            var tetelId, splitId, type, id;

            tetelId = event.target.parentNode.parentNode.parentNode.id;
            if (tetelId) {
                splitId = tetelId.split('-');
                type = splitId[0];
                id = parseInt(splitId[1]);

            }


            // 1. tétel törlése az adat obj-ból
            budgetController.teteTorol(type, id);

            // 2. tétel törlése a felületről
            surfaceController.tetelTorles(tetelId);
            // 3. összegek újraszámolása és megjelenítése a felületen
            osszegFrissitese();
        }

        //Kattintás az X  gombra
        if (event.target.className === "fas fa-times-circle") {
            frissites()
        }

        //Kattintás a pipa gombra
        if (event.target.className === "fas fa-check-circle") {

            tetelId = event.target.parentNode.parentNode.parentNode.id;
            if (tetelId) {
                splitId = tetelId.split('-');
                type = splitId[0];
                id = parseInt(splitId[1]);

            }



            // tétel frissítése az objectben.
            var titleInput = event.target.parentNode.parentNode.children[0].value   //input mező értékei
            var valueInput = event.target.parentNode.parentNode.children[1].value
            budgetController.tetelModosit(type, id, titleInput, valueInput);

            //tétel frissítése felületen
            datas = budgetController.getDatas();
            idTomb = datas.tetelek[type].map(function (actual) {
                return actual.id
            });
            index = idTomb.indexOf(id);
            const formatter = new Intl.NumberFormat('hu', {
                style: 'currency',
                currency: 'HUF',
                minimumFractionDigits: 0
            });
            event.target.parentNode.parentNode.parentNode.children[0].textContent = titleInput;
            event.target.parentNode.parentNode.parentNode.children[1].children[0].textContent = formatter.format(valueInput);


            osszegFrissitese();
            frissites();
        }
    }
    /*        var modalFnc = function () {
               var dom, modal, datas, modalSelect;
               dom = surfaceController.getDOMelements();
               datas = budgetController.getDatas();
   
               modal = document.querySelector(dom.modal)
               modal.style.display = "block";
   
   
   
   
               document.querySelector(dom.modalClose).addEventListener('click', () => {
   
                   modal.style.display = "none";
   
               })
               document.querySelector(dom.modalAccept).addEventListener('click', (e) => {
   
                   var dom, select, options, datas;
                   datas = budgetController.getDatas();
                   dom = surfaceController.getDOMelements();
                   select = document.querySelector(dom.month);
                   modalSelect = document.querySelector(dom.modalSelect);
   
   
   
                   datas.honap.push(modalSelect.value);
                   modal.style.display = "none";
                   options = datas.honap.map(m =>
                       `<option>${m}</option>`
                   )
   
                   select.innerHTML = options;
   
               })
           } */

    return {
        init: function () {
            /*      createOption() */
            surfaceController.ktgMegjelenites({
                koltsegvetes: 0,
                osszesBevetel: 0,
                osszesKiadas: 0,
                szazalek: -1,
            });
            esemenykezelokBeallit();
            surfaceController.aktualisHonapMegjelenites();

        }
    }

})(budgetController, surfaceController);

mainController.init();
