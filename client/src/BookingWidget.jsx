import { useContext, useEffect, useState } from "react"
import { differenceInCalendarDays } from "date-fns"
import axios from "axios";
import { Navigate } from "react-router-dom";
import {UserContext} from "./UserContext.jsx";

export default function BookingWidget({place}) {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [maxGuests, setMaxGuests] = useState(1);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [redirect, setRedirect] = useState('');
    const {user} = useContext(UserContext);

    useEffect( () => {
      if (user) {
        setName(user.name)
      }
    }, [user])

    let numberOfNights = 0;
    if (checkIn && checkOut) {
      numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
    }

    async function bookThis() {

        const bookingData = await axios.post('/bookings', {
            checkIn, checkOut, maxGuests, name, mobile,
        place:place._id, price:numberOfNights*place.price
    });
        const bookingId = bookingData.data._id
        setRedirect(`/account/bookings/${bookingId}`)
    }

    if (redirect) {
        return <Navigate to={redirect}/>
    }



    return (
    <div className="bg-white shadow p-4 rounded-2xl">
        <div className="text-2xl text-center">
          Price: ${place.price}/night
        </div>
        <div className="border rounded-2xl mt-4">
          <div className="flex">
             <div className="py-3 px-4">
              <label>Check in: </label>
              <input type="date" 
              value={checkIn} onChange={e => setCheckIn(e.target.value)}/>
             </div>
             <div className="py-3 px-4 border-l">
              <label>Check out: </label>
              <input type="date" 
              value={checkOut} onChange={e => setCheckOut(e.target.value)}/>
             </div>
          </div>
          <div className="py-3 px-4 border-t">
            <label>Number of guests: </label>
            <input type="number" min="1" max={place.maxGuests} 
            value={maxGuests} onChange={e => setMaxGuests(e.target.value)} />
          </div>
          {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t">
            <label>Your full name: </label>
            <input type="text" 
              value={name} onChange={e => setName(e.target.value)} />

            <label>Mobile Number: </label>
            <input type="tel" 
              value={mobile} onChange={e => setMobile(e.target.value)} />
          </div>
          )}



        </div>

        <button onClick={bookThis} className="primary mt-4">
            Book this place
            {numberOfNights >0 && (
                <span> ${numberOfNights*place.price}</span>
            )}
            
        </button>
    </div>
    )
}