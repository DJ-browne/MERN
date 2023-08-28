import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function IndexPage() {
  const [places, setPlaces] = useState([])
  useEffect(() => {
    axios.get('/places')
    .then(res => {
      setPlaces([...res.data])
      
    })
    .catch (err => {
      console.error(err)
    })
  },[]);


    return(
    <div className="mt-8 grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {places.length > 0 && places.map( place => (
      <Link to={'/places/'+place._id} key={place.id}>
        <div className="bg-gray-500 mb-2 rounded-2xl flex">
          {place.photo?.[0] && (
              <img className="rounded-2xl object-cover aspect-square" src={'http://localhost:4000/uploads/' + place.photo?.[0]} />
          )}
        </div>
          <h2 className="font-bold">{place.address}</h2>
          <h3 className="text-sm text-gray-500">{place.title}</h3> 
          <div className="mt-1">
            <span className="font-bold">${place.price}</span>/night
          </div>
      </Link>
      ))}
    </div>
    );
}