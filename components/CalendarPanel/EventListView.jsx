"use client"
import dayjs from 'dayjs';
import { FaUserCircle, FaBirthdayCake } from 'react-icons/fa';

const events = [
  {
    id: 1,
    serviceName: 'Masaje de Relax',
    startTime: '09:00',
    endTime: '10:30',
    date: '2024-06-01',
    color: 'bg-blue-200',
    clientName: 'John Doe',
    clientAge: 32,
    clientImage: '/avatars/avatar1.jpg',
    price: '$50.00',
    paid: '$30.00',
  },
  {
    id: 2,
    serviceName: 'Terapia de Piel',
    startTime: '11:00',
    endTime: '12:00',
    date: '2024-06-01',
    color: 'bg-green-200',
    clientName: 'Jane Smith',
    clientAge: 28,
    clientImage: '/avatars/avatar2.jpg',
    price: '$70.00',
    paid: null,
  },
  {
    id: 3,
    serviceName: 'Masaje de Relax',
    startTime: '13:00',
    endTime: '14:30',
    date: '2024-06-02',
    color: 'bg-blue-200',
    clientName: 'Emily Johnson',
    clientAge: 26,
    clientImage: '/avatars/avatar3.jpg',
    price: '$50.00',
    paid: '$20.00',
  },
  {
    id: 4,
    serviceName: 'Terapia de Piel',
    startTime: '09:00',
    endTime: '10:00',
    date: '2024-06-03',
    color: 'bg-green-200',
    clientName: 'Michael Brown',
    clientAge: 45,
    clientImage: null,
    price: '$70.00',
    paid: null,
  },
  {
    id: 5,
    serviceName: 'Masaje de Relax',
    startTime: '14:00',
    endTime: '15:30',
    date: '2024-06-03',
    color: 'bg-blue-200',
    clientName: 'Olivia Davis',
    clientAge: 32,
    clientImage: '/avatars/avatar4.jpg',
    price: '$50.00',
    paid: '$30.00',
  },
  {
    id: 6,
    serviceName: 'Terapia de Piel',
    startTime: '15:00',
    endTime: '16:00',
    date: '2024-06-04',
    color: 'bg-green-200',
    clientName: 'Daniel Martinez',
    clientAge: 28,
    clientImage: '/avatars/avatar5.jpg',
    price: '$70.00',
    paid: null,
  },
  {
    id: 7,
    serviceName: 'Masaje de Relax',
    startTime: '10:00',
    endTime: '11:30',
    date: '2024-06-05',
    color: 'bg-blue-200',
    clientName: 'Sophia Garcia',
    clientAge: 40,
    clientImage: null,
    price: '$50.00',
    paid: '$20.00',
  },
  {
    id: 8,
    serviceName: 'Terapia de Piel',
    startTime: '12:00',
    endTime: '13:00',
    date: '2024-06-05',
    color: 'bg-green-200',
    clientName: 'James Wilson',
    clientAge: 35,
    clientImage: '/avatars/avatar6.jpg',
    price: '$70.00',
    paid: null,
  },
  {
    id: 9,
    serviceName: 'Masaje de Relax',
    startTime: '14:00',
    endTime: '15:30',
    date: '2024-06-06',
    color: 'bg-blue-200',
    clientName: 'Charlotte Anderson',
    clientAge: 29,
    clientImage: '/avatars/avatar7.jpg',
    price: '$50.00',
    paid: '$30.00',
  },
  {
    id: 10,
    serviceName: 'Terapia de Piel',
    startTime: '16:00',
    endTime: '17:00',
    date: '2024-06-16',
    color: 'bg-green-200',
    clientName: 'David Thomas',
    clientAge: 33,
    clientImage: '/avatars/avatar8.jpg',
    price: '$70.00',
    paid: null,
  },
  {
    id: 11,
    serviceName: 'Masaje de Relax',
    startTime: '09:00',
    endTime: '10:30',
    date: '2024-06-17',
    color: 'bg-orange-200',
    clientName: 'Emma Lee',
    clientAge: 37,
    clientImage: null,
    price: '$50.00',
    paid: '$20.00',
  },
  {
    id: 12,
    serviceName: 'Terapia de Piel',
    startTime: '11:00',
    endTime: '12:00',
    date: '2024-06-27',
    color: 'bg-yellow-200',
    clientName: 'William Hernandez',
    clientAge: 50,
    clientImage: '/avatars/avatar9.jpg',
    price: '$70.00',
    paid: null,
  },
];

export const EventListView = ({ session, height }) => {
  const isPastEvent = (date) => dayjs(date).isBefore(dayjs(), 'day');

  const accentColorBorder = (color) => {
    var c = color.split("-");
    return "border-t-" + c[1] + "-500";
  }

  const eventTextColor = (color) => {
    var c = color.split("-");
    return "text-" + c[1] + "-600";
  }

  return (
    <div className="w-8/12 mx-auto p-4 max-w-4xl mb-40" style={{height: height + "px"}}>
      <div className="p-4 border border-gray-200 rounded">
        {events.map((event, index) => (
          <div key={index} className="mb-8 flex items-start relative">
            <div className="w-1/3 text-sm text-gray-500">
              {dayjs(event.date).format('ddd D/MM/YYYY')}
              <hr className="border-gray-300 mt-1 mb-2 absolute w-full top-3" />
            </div>
            <div className={`w-2/3 relative p-4 rounded-md shadow-md ml-4 mt-8 border-t-2 ${event.color} ${accentColorBorder(event.color)}`}>
              <div className="absolute right-0 top-0 text-xs text-gray-600 mr-2 mt-1">{event.startTime}</div>
              <div className="absolute right-0 bottom-0 text-xs text-gray-600 mr-2 mb-1">{event.endTime}</div>
              <div className="flex items-center">
                {event.clientImage ? (
                  <img src={event.clientImage} alt={event.clientName} className="w-12 h-12 rounded-full mr-4" />
                ) : (
                  <FaUserCircle className="w-12 h-12 ${event.color} mr-4" />
                )}
                <div>
                  <div className={`font-bold ${eventTextColor(event.color)}`}>{event.clientName}</div>
                  <div className={`text-xs ${eventTextColor(event.color)} flex items-center`}>
                    {event.clientAge} años {dayjs(event.date).isSame(dayjs(`${dayjs(event.date).year()}-${dayjs(event.date).month() + 1}-${dayjs(event.date).date()}`), 'day') && (
                      <FaBirthdayCake className="text-yellow-400 ml-2" />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className={`text-lg font-bold ${eventTextColor(event.color)}`}>{event.serviceName}</div>
                <div className="text-sm text-gray-800">{event.description}</div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <div className="text-lg font-bold text-gray-800">{event.price}</div>
                {event.paid && (
                  <div className="text-sm text-gray-600">Abonado: {event.paid}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};