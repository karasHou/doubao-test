const PetSVG = ({ type, size = 120 }) => {
  if (type === 'dog') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="60" rx="25" ry="30" fill="#8B4513" />
        <ellipse cx="50" cy="35" rx="20" ry="25" fill="#A0522D" />
        <circle cx="40" cy="30" r="3" fill="black" />
        <circle cx="60" cy="30" r="3" fill="black" />
        <path d="M 45 40 Q 50 45 55 40" stroke="black" strokeWidth="1.5" fill="none" />
        <ellipse cx="35" cy="25" rx="8" ry="10" fill="#A0522D" />
        <ellipse cx="65" cy="25" rx="8" ry="10" fill="#A0522D" />
        <path d="M 30 50 Q 25 40 20 35" stroke="#8B4513" strokeWidth="3" fill="none" />
        <path d="M 70 50 Q 75 40 80 35" stroke="#8B4513" strokeWidth="3" fill="none" />
        <ellipse cx="40" cy="75" rx="8" ry="10" fill="#8B4513" />
        <ellipse cx="60" cy="75" rx="8" ry="10" fill="#8B4513" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="55" rx="20" ry="25" fill="#696969" />
      <ellipse cx="50" cy="35" rx="18" ry="22" fill="#808080" />
      <circle cx="42" cy="32" r="4" fill="green" />
      <circle cx="58" cy="32" r="4" fill="green" />
      <path d="M 45 38 Q 50 42 55 38" stroke="black" strokeWidth="1.5" fill="none" />
      <path d="M 25 40 Q 15 30 10 20" stroke="#696969" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 75 40 Q 85 30 90 20" stroke="#696969" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 30 65 Q 25 80 20 90" stroke="#696969" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 70 65 Q 75 80 80 90" stroke="#696969" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="45" cy="65" rx="6" ry="8" fill="#696969" />
      <ellipse cx="55" cy="65" rx="6" ry="8" fill="#696969" />
    </svg>
  );
};

export default PetSVG;