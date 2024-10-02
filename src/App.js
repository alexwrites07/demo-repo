import React, { useState, useEffect } from 'react';
import './App.css';
import pic from './assets/male-profile-picture-vector.jpg';
import dot from './assets/3 dot menu.svg';
import plus from './assets/add.svg';
import lowPriority from './assets/Img - Low Priority.svg';
import mediumPriority from './assets/Img - Medium Priority.svg';
import highPriority from './assets/Img - High Priority.svg';
import urgentPriority from './assets/SVG - Urgent Priority colour.svg';
import nop from './assets/No-priority.svg';
import display from './assets/Display.svg';
import inpic from './assets/in-progress.svg';
import todo from './assets/To-do.svg';
import back from './assets/Backlog.svg';
import profile1 from './assets/download (1).jpg';
import profile2 from './assets/download.jpg';
import profile3 from './assets/images (1).jpg';
import profile4 from './assets/images.jpg';
import profile5 from './assets/male-profile-picture-vector.jpg';
import donePic from './assets/Done.svg';
import cancelledPic from './assets/Cancelled.svg';


const App = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [groupBy, setGroupBy] = useState(localStorage.getItem('groupBy') || 'status'); // Default value from localStorage
  const [sortBy, setSortBy] = useState(localStorage.getItem('sortBy') || 'priority'); // Default value from localStorage

  // Toggles the dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Fetch data from API when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
        const data = await response.json();
        setTickets(data.tickets);
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Grouping logic
  const getGroupedTickets = () => {
    let groupedTickets = {};

    if (groupBy === 'status') {
      groupedTickets = tickets.reduce((acc, ticket) => {
        const key = ticket.status;
        acc[key] = acc[key] ? [...acc[key], ticket] : [ticket];
        return acc;
      }, {});
    } else if (groupBy === 'user') {
      groupedTickets = tickets.reduce((acc, ticket) => {
        const user = users.find(u => u.id === ticket.userId);
        const key = user ? user.name : 'Unknown';
        acc[key] = acc[key] ? [...acc[key], ticket] : [ticket];
        return acc;
      }, {});
    } else if (groupBy === 'priority') {
      groupedTickets = tickets.reduce((acc, ticket) => {
        const priorityNames = ['No priority', 'Low', 'Medium', 'High', 'Urgent'];
        const key = priorityNames[ticket.priority] || 'No priority';
        acc[key] = acc[key] ? [...acc[key], ticket] : [ticket];
        return acc;
      }, {});
    }

    return groupedTickets;
  };

  // Sorting logic
  const sortTickets = (tickets) => {
    if (sortBy === 'priority') {
      return [...tickets].sort((a, b) => a.priority - b.priority);
    } else if (sortBy === 'title') {
      return [...tickets].sort((a, b) => a.title.localeCompare(b.title));
    }
    return tickets;
  };

  // Handle changes in dropdowns
  const handleGroupByChange = (e) => {
    const value = e.target.value;
    setGroupBy(value);
    localStorage.setItem('groupBy', value); // Store in localStorage
    setShowDropdown(false); // Close dropdown
  };

  const handleSortByChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    localStorage.setItem('sortBy', value); // Store in localStorage
    setShowDropdown(false); // Close dropdown
  };
  const renderKanbanBoard = () => {
    const groupedTickets = getGroupedTickets();
    const groupKeys = Object.keys(groupedTickets).slice(0, 10); // Limit to max 10 columns
  
    // Mapping of status to corresponding profile pictures
    const statusProfilePics = {
      'Todo': todo,
      'Backlog': back,
      'In progress': inpic,
      'Done': donePic,
      'Cancelled': cancelledPic,
    };
  
    // Mapping of user ids to profile images
    const userProfileImages = {
      'usr-1': profile1,
      'usr-2': profile2,
      'usr-3': profile3,
      'usr-4': profile4,
      'usr-5': profile5,
    };
  
    // Define the priority order
    const priorityOrder = ['Urgent', 'High', 'Medium', 'Low', 'No Priority'];
  
    // Sort groupKeys based on groupBy
    let sortedGroupKeys;
    if (groupBy === 'priority') {
      sortedGroupKeys = groupKeys.sort((a, b) => 
        priorityOrder.indexOf(a) - priorityOrder.indexOf(b)
      );
    } else if (groupBy === 'user') {
      sortedGroupKeys = groupKeys.sort((a, b) => {
        const userA = users.find(u => u.id === a);
        const userB = users.find(u => u.id === b);
        return (userA?.name || '').localeCompare(userB?.name || '');
      });
    } else {
      sortedGroupKeys = groupKeys; // No specific sorting for other groups
    }
  
    return sortedGroupKeys.map(group => {
      let priorityImage;
      const sortedTickets = sortTickets(groupedTickets[group]);
  
      // Fetch the appropriate image based on grouping
      if (groupBy === 'user') {
        const user = users.find(u => u.id === group);
        priorityImage = userProfileImages[sortedTickets[0]?.userId] || pic; // Get user image from the first ticket
      } else if (groupBy === 'priority') {
        switch (group) {
          case 'Low':
            priorityImage = lowPriority;
            break;
          case 'Medium':
            priorityImage = mediumPriority;
            break;
          case 'High':
            priorityImage = highPriority;
            break;
          case 'Urgent':
            priorityImage = urgentPriority;
            break;
          default:
            priorityImage = nop;
        }
      } else if (groupBy === 'status') {
        priorityImage = statusProfilePics[group] || pic; // Fallback to default pic if not found
      }
  
      return (
        <div className="kanban-column" key={group} style={styles.kanbanColumn}>
          {/* Check if group is 'Done' or 'Cancelled' */}
          {group === 'Done' || group === 'Cancelled' ? (
            <div style={styles.columnHeader}>
              <div style={styles.containerLeft}>
                <img 
                  src={group === 'Done' ? donePic : cancelledPic} 
                  alt={`${group} Status`} 
                  style={styles.sectionImage1} 
                />
                <h3 style={styles.headerTitle}>
                  {group} {' '} {groupedTickets[group].length}
                </h3>
              </div>
  
              <div style={styles.columnActions}>
                <button style={styles.actionButton}><img src={plus} alt="Add" /></button>
                <button style={styles.actionButton}><img src={dot} alt="Options" /></button>
              </div>
            </div>
          ) : (
            <div style={styles.columnHeader}>
              <div style={styles.containerLeft}>
                <img 
                  src={priorityImage} 
                  alt={groupBy === 'user' ? `${group} User` : `${group} Status`} 
                  style={styles.sectionImage1} 
                />
                <h3 style={styles.headerTitle}>
                  {group} {' '} {groupedTickets[group].length}
                </h3>
              </div>
  
              <div style={styles.columnActions}>
                <button style={styles.actionButton}><img src={plus} alt="Add" /></button>
                <button style={styles.actionButton}><img src={dot} alt="Options" /></button>
              </div>
            </div>
          )}
  
          {/* Render the tickets for the current group */}
          {sortedTickets.map(ticket => {
            const user = users.find(u => u.id === ticket.userId);
            const statusImage = statusProfilePics[ticket.status] || pic; // Default image if status not found
  
            // Determine which image to show based on the current grouping
            const displayImage = groupBy === 'user' ? userProfileImages[ticket.userId] || pic :
              (groupBy === 'status' ? statusImage : priorityImage); // Fallback to priorityImage
  
            return (
              <div className="kanban-card" key={ticket.id} style={styles.kanbanCard}>
                <div className="ticket-header">
                  <span className="ticket-id">{ticket.id}</span>
                </div>
                <div style={styles.container}>
                  {(groupBy === 'user' || groupBy === 'priority') && (
                    <img className="ticket-img" src={statusImage} alt={ticket.status} style={styles.sectionImage} />
                  )}
                  <h4 className="ticket-title" style={{ marginRight: '20px' }}>{ticket.title}</h4>
                </div>
  
                <div style={styles.container}>
                  <br /><br />
                  <button style={styles.actionButton1}>
                    {(groupBy === 'user' || groupBy === 'status') && (
                      <img src={displayImage} alt="" style={styles.priorityImage} />
                    )}
                  </button>
                  <div className="container gg">
                    <div className="dot"></div>
                    <p className="ticket-tag" style={styles.ticketTag}>{ticket.tag}</p>
                  </div>
                </div>
                <div style={styles.profilePictureContainer}>
                  <img
                    src={userProfileImages[ticket.userId]} // Use userId to fetch the correct profile image
                    alt={user ? user.name : "Unknown User"}
                    style={styles.profilePicture}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };
  

 
  

  return (
    <div>
      <div style={styles.backgroundRectangle}></div>
      <div style={styles.wrapper}>
        {/* Rectangle background */}
        <div className="display-dropdown-container abv" style={styles.dropdownContainer}>
          {/* Display Button */}
          <div className="abv">
            <button className="dropdown-button" onClick={toggleDropdown}>
              <span className="dropdown-icon"><img className="lp" src={display}></img></span> Display
            </button>
            <br /><br />

            {/* Dropdown Content */}
            {showDropdown && (
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <label>Grouping</label>
                  <select value={groupBy} width={100} onChange={handleGroupByChange}>
                    <option value="status">Status</option>
                    <option value="user">User</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>

                <div className="dropdown-section">
                  <label>Ordering</label>
                  <select value={sortBy} width={100} onChange={handleSortByChange}>
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="kanban-board" style={styles.kanbanBoard}>
          {renderKanbanBoard()}
        </div>
      </div>
    </div>
  );
};

// CSS styles as JS objects for inline styling
const styles = {
  container: {
    display: 'flex', // Flexbox to position elements side by side
    alignItems: 'center', // Vertically align image and heading
    gap: '10px', // Add space between image and text
  },
  
 
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between', // Ensures left and right sections are spaced out
    alignItems: 'center', // Aligns items vertically center
    width: '100%', // Ensures the header takes full width
    padding: '10px', // Add some padding for spacing
  },
  containerLeft: {
    display: 'flex',
    
    alignItems: 'center', // Vertically center the image and text
    flex: '0 0 65%', // Makes this container 65% of the width
  },
  sectionImage1: {
    width: '30px', // Adjust as needed
    height: '30px', // Adjust as needed
    marginRight: '10px', // Space between image and title
    alignItems: 'center',
    marginTop:'-20px',
  },
  headerTitle: {
    fontSize: '16px', // Adjust as needed
  },
  columnActions: {
    alignItems: 'center',
    display: 'flex',
    alignItems: 'center', // Center align the buttons
    flex: '0 0 25%', // Makes this container 25% of the width
    justifyContent: 'flex-end', // Aligns buttons to the right
  },
  actionButton: {
    background: 'transparent', // Transparent background for buttons
    border: 'none', // No border for buttons
    cursor: 'pointer', // Pointer cursor on hover
   
    marginTop:'-20px',
  },
  actionButton1: {
    background: 'transparent', // Transparent background for buttons
    border: 'none', // No border for buttons
    cursor: 'pointer', // Pointer cursor on hover
   
    marginTop:'10px',
  },
 
  wrapper: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    position: 'relative', // Ensure children can be positioned absolutely
  },
  backgroundRectangle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '120px',
    backgroundColor: 'white',
    zIndex: 1, // Ensure it's above other content
  },
  dropdownContainer: {
    position: 'relative', // Ensure dropdown is positioned correctly
    zIndex: 2, // Ensure dropdown appears above the rectangle
  },
  kanbanBoard: {
    display: 'flex',
    gap: '20px',
   
   overflowX:'none',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Responsive grid with same column width
    gap: '30px',
   
    marginTop: '50px', // Space for the rectangle
  },
  kanbanColumn: {
    flex: 1,
    minWidth: '300px',
    padding: '10px',
    backgroundColor: '#F4F6FA',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
    maxWidth: '550px', // Fixed width for each column
    flexBasis: '300px', // Ensures consistent width for each column
  },
  kanbanCard: {
    background: 'white',
    padding: '10px',
    marginBottom: '10px',
    position: 'relative', // Allow absolute positioning of profile picture
   
    width: '96%', // Ensure cards take full width of the column
    boxSizing: 'border-box', // Prevent overflow due to padding
  },
 
 
 
  priorityImage: {
    width: '20px', // Adjust size of priority image
    height: '20px',
    marginRight: '5px', // Add spacing between image and title
  },
  profilePictureContainer: {
    position: 'absolute',
    top: '5px',
    right: '5px',
  },
  profilePicture: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
  },
};

export default App;
