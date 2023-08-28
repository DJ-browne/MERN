import Image from "./Image.jsx";

export default function PlaceImg({place,index=0,className=null}) {
  if (!place.photo?.length) {
    return '';
  }
  if (!className) {
    className = 'object-cover';
  }
  return (
    <Image className={className} src={place.photo[index]} alt=""/>
  );
}