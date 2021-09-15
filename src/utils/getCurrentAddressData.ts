export function getCurrentAddressData(customerAddress: any) {

    let currentAddress;
    let currentAddress2;
    let currentCity;
    let customerAddressName;
    let customerCountry;
    let customerState;
    let customerZip;
    let customerDefaultAddress;

    if (localStorage.temporalDefaultAddress !== undefined && localStorage.temporalDefaultAddress !== '') {
        currentAddress = JSON.parse(localStorage.temporalDefaultAddress).customerAddress1;
        currentAddress2 = JSON.parse(localStorage.temporalDefaultAddress).customerAddress2
        currentCity = JSON.parse(localStorage.temporalDefaultAddress).customerCity;
        customerAddressName = 'Current Location';
        customerCountry = JSON.parse(localStorage.temporalDefaultAddress).customerCountry;
        customerState = JSON.parse(localStorage.temporalDefaultAddress).customerState;
        customerZip = JSON.parse(localStorage.temporalDefaultAddress).customerZip;
        customerDefaultAddress = JSON.parse(localStorage.temporalDefaultAddress);
    } else {
        currentAddress = customerAddress.customerAddress1;
        currentAddress2 = customerAddress.customerAddress2;
        currentCity = customerAddress.customerCity;
        customerAddressName = 'Current Location';
        customerCountry = customerAddress.customerCountry;
        customerState = customerAddress.customerState;
        customerZip = customerAddress.customerZip;
        customerDefaultAddress = customerAddress;
    }

    const currentAddressId = localStorage.temporalDefaultAddress !== undefined && localStorage.temporalDefaultAddress !== ''
      ? JSON.parse(localStorage.temporalDefaultAddress)._id
      : customerDefaultAddress._id;

    return {
        currentAddress,
        currentAddress2,
        currentCity,
        customerAddressName,
        customerCountry,
        customerState,
        customerZip,
        customerDefaultAddress,
        currentAddressId
    };
}
