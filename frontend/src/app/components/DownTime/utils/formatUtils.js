// ./src/app/components/DownTime/utils/formatUtils.js

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error formatting date";
    }
  };
  
  export const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date time:", error);
      return "Error formatting date";
    }
  };
  
  export const formatLongDateTime = (dateString) => {
    if (!dateString || dateString === "Not recorded") return "Not recorded";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error formatting date";
    }
  };
  
  export const formatDowntimeHours = (minutes) => {
    if (!minutes && minutes !== 0) return '-';
    return (minutes / 60).toFixed(1);
  };
  
  export const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  export const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return '-';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''}`;
    } else if (mins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    }
  };