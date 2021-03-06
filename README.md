# Apka Rajdowa v2 Backend 
by `NativeFlow` 

## Doc
* swagger -> https://apka-rajdowa-v2-dev.herokuapp.com/api/v1/swagger/

## The architecture concept of this application is based on the following frameworks : 

* `Express` - https://expressjs.com/
* `Tsoa` - https://github.com/lukeautry/tsoa
* `Mongoose`- https://mongoosejs.com/

## Running

* To run app in development mode (server will restart after each change) : `yarn dev`
* To run app in production mode use `yarn build and `yarn start`


## Glossary (PL)
`Administrator` - Osoba uprawniona do danych danego wydarzenia.

`Owner` - Administrator który ma uprawnienia zezwalające na zmienienie konfiguracji wydarzenia.

`User` - Użytkownik z puntu widzenia całego systemu a nie konkretnego wydarzenia.


## Dynamic schema
```javascript
    //pole tekstowe
    field1: { type: 'string' },

    //pole liczbowe
    field2: { type: 'number' },

    //pole jednokrotnego wyboru, np. tak/nie lub samo tak
    //czy zgadzasz sie z regulaminem, plec
    field3: { type: 'string', enum: ['Tak', 'Nie'], htmlType: 'radio'},
    //do przemyslenia czy klucze to wartosci ktore trafiaja do bazy - problem z polskimi znakami, itp

    //pole wielokrotnego wyboru
    field4: { type: ['string'], enum: ['Tak', 'Nie', 'Nie wiem'] },
    //problem z typem field4 - nie jest jak reszta obiektem tylko array'em
    field5: { type: 'boolean', htmlType: 'checkbox' }, //TODO????

    //select
    field5: { type: 'string', enum: ['Tak', 'Nie', 'Nie wiem'], htmlType: 'select' },

    //unique
    field6: { type: 'string', unique: true },
    //do sprawdzenia w jaki sposob definiuje sie wartosci unikalne
    //wartosc unique w mongoose nie sluzy do walidowania czy dodawana wartosc jest unikalna tylko jest to informacja dla mongo do celow optymalizacji wyszukiwania danych


    //hidden - wartosc nie widoczna w formularzu ale widoczna na liscie (czy moze istniec odwrotny przypadek?)
    field7: { type: 'string', isHidden: true },

    //required
    field8: { type: 'string', required: true, default: 'TEST' }, //pole required jest tez wykorzystywane przez mongoose

    //name and description
    field9: { type: 'string', name: 'Imię:', description: 'Tutaj podaj swoje imię', tooltip: "To jest treść ewentualnego tooltipa"},

    //NIE ZAIMPLEMENTOWANE:
    //walidacja pol - do przemyslenia (nie wiem jak ogarnac to w mongoose)
    field10: { type: 'string', regex: 'jakis reges????', validate: 'tutaj wrzuca sie customowy walidator mongoosea - nizej przyklada'},
    validate: {
        validator: function(v) {
           return /\d{3}-\d{3}-\d{4}/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
    },

    //nazwy pol w schemacie, np. field1, field2 to kolejne wartosci field[numer] - cel - unikalnosc pol
```