# OrderOS

OrderOS site , with all the flow :

- DineIn
- Delivery
- PickUp
- Curbside

## Features

- Add new function for scan qr
- New responsive tools
- Add guest flow for DineIn
- Add create order without login

> For use order OrderOS is important remenber
> have all the configuratiin of the dashboard
> ready, if the store configuration it's not
> complete the proyect show 404 page

## Tech

OrderOS uses a number of open source projects to work properly:

- [AngularJS] - HTML enhanced for web apps!
- [Material design] - For components and responsive
- [Momentjs] - we use moment for time formats.
- [Bootstrap] - great UI boilerplate for modern web apps
- [node.js] - evented I/O for the backend
- [Express] - fast node.js network app framework [@tjholowaychuk]

## Installation

OrderOS requires [Node.js](https://nodejs.org/) v12+ to run.

Install the dependencies and devDependencies and start the proyect.

```sh
npm i
ng serve --disable-host-check
```

## Development

The application use sub domines and need a store for get the data , this is a example of how can see a store

```sh
ng serve --disable-host-check
in the browser use for example : http://ucrave.lvh.me:4200/ where "ucrave" is the store name
```

#### Building for source

For production release:

```sh
ng build --prod
```

Generating pre-built zip archives for distribution:

```sh
ng build dist --prod
```

## License

MIT
