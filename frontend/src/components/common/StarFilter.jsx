const StarFilter = ({ label, value, setValue }) => (
  <div className="star-filter">
    <label>{label}</label>
    <div>
      {[1,2,3,4,5].map(s =>
        <span key={s}
          className={`star ${value>=s?'full':''}`}
          onClick={()=>setValue(value===s? '' : s)}>★</span>
      )}
    </div>
  </div>
);
export default StarFilter;
