const SortControls = ({ sortBy, sortOrder, setSortBy, setSortOrder }) => (
  <div className="sort-controls">
    <label>Sort By:</label>
    <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
      <option value="createdAt">Newest</option>
      <option value="ratings.overall">Rating</option>
      <option value="fees.tuition.minAmount">Fee</option>
      <option value="name">Name A‑Z</option>
    </select>
    <select value={sortOrder} onChange={e=>setSortOrder(e.target.value)}>
      <option value="desc">Desc</option>
      <option value="asc">Asc</option>
    </select>
  </div>
);
export default SortControls;
