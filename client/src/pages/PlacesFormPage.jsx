import Perks from "../Perks";
import PhotosUploader from "../PhotosUploader";
import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "../AccountNav";
import { Navigate, useParams } from "react-router-dom";


 export default function PlacesFormPage() {
    const {id} = useParams();

    const [title, setTitle] = useState('');
    const [address, setAddress] = useState([]);
    const [addedPhotos, setAddedPhotos] = useState('');
    const [description, setDescription] = useState('');
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [maxGuests, setMaxGuests] = useState(1);
    const [price, setPrice] = useState(100);
    const [redirect, setRedirect] = useState(false);

    useEffect(()=> {
        if(!id) {
            return;
        }
        axios.get('/places/'+id)
        .then(res => {
            const {data} = res;
            setTitle(data.title);
            setAddress(data.address);
            setAddedPhotos(data.photo);
            setDescription(data.description);
            setPerks(data.perks);
            setExtraInfo(data.extraInfo);
            setCheckIn(data.checkIn);
            setCheckOut(data.checkOut);
            setMaxGuests(data.maxGuests);
            setPrice(data.price);
        }).catch (err => {
            console.error('Error is : ',err)
        });
    }, [id])

    function inputHeader(text) {
        return (
            <h2 className="text-2xl mt-4">{text}</h2> 
        );
    }

    function inputDescription(text) {
        return (
            <p className="text-gray-500 text-sm">{text}</p> 
        );
    }

    function preInput(header,description) {
        return (
            <>
            {inputHeader(header)}
            {inputDescription(description)} 
            </>
            
        );
    }

    async function savePlace(e) {
        e.preventDefault();
        const placeData = {id, title, address, addedPhotos, 
            description, perks, extraInfo, 
            checkIn, checkOut, maxGuests, price 
        }
        if(id) {
            //update
        await axios.put('/places/:id', {
            id, ...placeData
        })
        .then( res => {
          res.josn()
        })
        .catch( (err) => {
            console.error("Error :", err)
        });

        setRedirect(true);

       
        } else {
            //new place
            await axios.post('/places', placeData)
            .catch( (err) => {
                console.error("Error:", err)
            });
            setRedirect(true);
    
        }

    } 
       

    if(redirect) {
        return <Navigate to={'/account/places'}/>
    }

    return (
        <div>
            <AccountNav/>
                <form onSubmit={savePlace}>
                    {preInput('Title','Title for your place (should be short and catchy!)')}
                        <input type="text"  value={title} onChange={e=> setTitle(e.target.value)} placeholder="title, for example: My lovely apartment!"/>
                    {preInput('Address','Address to this place')}
                        <input type="text" value={address} onChange={e=> setAddress(e.target.value)} placeholder="address"/>
                    {preInput('Photos','More the Better!')}
                    <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos}/>
                    {preInput('Description','Description of your place')}
                    <textarea value={description} onChange={e=> setDescription(e.target.value)} />
                    {preInput('Perks','Select all the perks of your place')}
                    
                    <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        <Perks selected={perks} onChange={setPerks}/>
                    </div>

                        {preInput('Extra information','House rules, etc')}
                        <textarea value={extraInfo} onChange={e=> setExtraInfo(e.target.value)} /> 
                        {preInput('Check in & out / Max guests','Add check in and out times, remember to have some time for cleaning the place')}
                        
                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                            <div>
                                <h3 className="mt-2 -mb-1">Check in</h3>
                                <input type="text" value={checkIn +':00'} onChange={e=> setCheckIn(e.target.value)} placeholder="14:00"/>
                            </div>
                            <div>
                                <h3 className="mt-2 -mb-1">Check out</h3>
                                <input type="text" value={checkOut+':00'} onChange={e=> setCheckOut(e.target.value)} placeholder="11:00"/>
                            </div>
                            <div>
                                <h3 className="mt-2 -mb-1">Max number of guests</h3>
                                <input type="number" value={maxGuests} onChange={e=> setMaxGuests(e.target.value)}/>
                            </div>
                            <div>
                                <h3 className="mt-2 -mb-1">Price per night</h3>
                                <input type="number" value={price} onChange={e=> setPrice(e.target.value)}/>
                            </div>
                        </div>
                            <button className="primary my-4">Save</button>
                                            
                                                            
                </form>
            </div>
    )
 }