let months = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
let days = ["Dimanche", "Lundi", "Mardi", "Mercredi","Jeudi","Vendredi","Samedi"];

export const getDay = (timestamp) => {
    let date = new Date (timestamp);

    return `${date.getDate()} ${months[date.getMonth()]}`
}