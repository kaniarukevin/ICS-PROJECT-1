const StarRating = ({ value }) => {
  const full = Math.floor(value), half = value-full>=0.5;
  return (
    <div className="star-rating">
      {[...Array(5)].map((_,i) => (
        <span key={i} className={
          i<full ? 'full' : i===full && half ? 'half' : 'empty'
        }>★</span>
      ))}
      <span className="val">{value.toFixed(1)}</span>
    </div>
  );
};
export default StarRating;
