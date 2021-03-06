
import PropTypes from 'prop-types'
import './eventDetail.css'
import { Dropdown, Menu, Button, Input, Tag } from 'antd';
const { TextArea } = Input;
import React, { Component } from "react";
import {Modal} from 'antd';
import fb from '../../assets/fb.svg';
import {
    MoreOutlined,
  } from '@ant-design/icons';
import URLIMage from "../../assets/URL.svg";
import shareImg from "../../assets/share.svg";
import AddBookmark from "../../assets/addBookmark.svg";
import Bookmarked from "../../assets/bookmarked.svg";
import { FB_URL } from "../../constants/APIConstant";
import moment from 'moment';
import {
    FacebookShareButton,
} from 'react-share';


/*
 * event info 
 * images
 * name
 * description
 * event type
 * subscription fees
 * url
 * date and time of event
 * actions for organizers and subscribers like:
 * subscribers:
 * sharing event
 * sharing event on facebook
 * wishlisting the event
 * organizers: the ones who created the event
 * edit event details
 * cancel events
 */
class EventInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cancelPopup: false,
            message: '',
            bookmarked: this.props.eventData.is_wishlisted||false,
        }
      }

      //handle dropdown menu selection
    takeMenuAction = (input) => {
        if(input.key === "1")
          this.setState({
              cancelPopup: true
          })
        else if(input.key === "2") {
            this.props.setEventUpdate(true);
            this.props.history.push(`/create?type=edit&id=${this.props.eventData.id}`);
        }
            
    }

    //to handle cancel event popup close
    handleClose = () => {
        this.setState({
            cancelPopup: false
        })
    }

    //to save message for update/reminders/share
    onChange = (event) => {
        this.setState({
            message: event.target.value,
        })
    }

    // function to handle confirmation of event cancellation
    cancel = () => {
        this.setState({
            cancelPopup: false,
        })
        const {eventData, cancelEvent,history, accessToken} = this.props;
        cancelEvent({
            message: this.state.message,
            accessToken: accessToken,
            eventId: eventData.id,
            callback: (error) => {
                if(!error){
                    history.push("/dashboard");
                }
                else{
                    console.error(error);
                }
            }
        });
    }

    //handle wishlist operations
    handleBookmark = () => {
        let currentState = this.state.bookmarked;
        const {eventData, handleWishlist, accessToken} = this.props;
        handleWishlist({
            data: {event_id:eventData.id},
            accessToken,
            updateType: !currentState?"add":"delete",
            callback: () => {
                this.setState({
                    bookmarked:!this.state.bookmarked
                })
            }
        }); 
    }

    render() {
        const bookMarkImg = this.state.bookmarked?Bookmarked:AddBookmark;
        const menuSidebar = (
            <Menu onClick={key => this.takeMenuAction(key)}>
                <Menu.Item key="1">Cancel</Menu.Item>
                <Menu.Item key="2">Edit</Menu.Item>
            </Menu>
        );
        const {eventData, eventType, isOrganizer, handleShare} = this.props;
        let eventDate = eventData.date + " "+ eventData.time;
        eventDate = moment(eventDate,"YYYY-MM-DD hh:mm A");
        eventDate = eventDate.format("DD MMM' YY, hh:mm A");
        let event_status = eventData.event_status;
        const tagColor = `${event_status === 'upcoming' ? 'orange' : ''}${event_status === 'cancelled' ? 'red' : ''}${event_status === 'completed' ? 'green' : ''}`;
        return (
            <div className="detail-card">
                <div className="detail-card-top">
                    <div className="detail-image-div">
                        <img src={eventData.images} className="detail-img"/>
                        {eventData.is_subscribed && 
                            <Tag color="#e8c7f5" style = {{position: 'absolute'}} className="status-button ellipsis-style">
                                Subscribed
                            </Tag>
                        }
                    </div>
                    <div className="detail-card-top-descContainer">
                        <h2>{eventData.name}</h2>
                        <div className="detail-card-top-desc">
                            {eventData.description}
                        </div>
                    </div>
                    {isOrganizer && eventData.self_organised && eventData.event_status === "upcoming" ? (
                        <Dropdown overlay={menuSidebar}>
                        <MoreOutlined style={{ height: "10px" }} />
                        </Dropdown>
                    ) : !isOrganizer? (
                        <div>
                            <img src={shareImg}  style={{height:"20px",width:"20px",cursor:"pointer"}} onClick={handleShare}/>
                            <img src={bookMarkImg} style={{height:"20px",width:"20px",cursor:"pointer", marginLeft:"10px"}} onClick={this.handleBookmark}/>
                            <FacebookShareButton url={`${FB_URL}event-details?id=${eventData.id}`}>
                                <img className="subscriber-image" src={fb}/>
                            </FacebookShareButton>
                        </div>
                    ):null}
                </div>
                <div className="detail-card-top-other">
                    <div className="detail-card-top-other-box">
                        <div><b>Type of Event</b></div>
                    <div className="capitalize">{eventType.length>0 && (eventData.event_type||eventData.type)?eventType.find(option => (eventData.event_type === option.id)||(eventData.type===option.id)).type:""}</div>
                    </div>
                    <div className="detail-card-top-other-box">
                        <div><b>No. of Tickets</b></div>
                    <div>{eventData.no_of_tickets}</div>
                    </div>
                    <div className="detail-card-top-other-box">
                        <div><b>Event Date & Time</b></div>
                        <div>{eventDate}</div>
                    </div>
                    <div className="detail-card-top-other-box">
                        <div><b>Subscription Fee</b></div>
                    <div>{eventData.subscription_fee===0?"FREE":"₹ "+eventData.subscription_fee}</div>
                    </div>
                    <div className="detail-card-top-other-box">
                        <div><b>Status</b></div>
                        <Tag style={{ marginRight: "0px",}} color={tagColor}  >
                            <span className="capitalize ellipsis-style">
                                {event_status}
                            </span>
                        </Tag>
                    </div>
                    <div className="detail-card-top-other-box">
                        <div><b>URL</b></div>
                        <div><a rel="noopener noreferrer" href={eventData.external_links} target="_blank"><img src={URLIMage}/></a></div>
                    </div>
                </div>

                {this.state.cancelPopup &&
                    <Modal
                        visible
                        onCancel = {this.handleClose}
                        title = {<div className = 'modal-header'>Cancel Event</div>}
                        footer = {null}
                        width={660}
                    >
                        <TextArea 
                            rows={2} 
                            placeholder="Message"
                            onChange={this.onChange}
                        />
                        <div>*Complete amount will be refunded to subscribers.</div>
                        <div>*Cancellation email and notification will be sent to all subscribers</div>
                        <div className = 'send-button-row'>
                            <div className = 'send-button'>
                                <Button onClick={this.handleClose}>Cancel</Button>
                                <Button disabled={this.state.message.length < 1} type="primary" onClick={this.cancel}>Confirm</Button>
                            </div>
                        </div>
                    </Modal>
                }
            </div>
        );
    }
 }


 EventInfo.propTypes = {
    eventData: PropTypes.object.isRequired,
    isOrganizer: PropTypes.bool,
    handleShare: PropTypes.func,
    history: PropTypes.object,
    setEventUpdate: PropTypes.func,
    eventType: PropTypes.array,
    cancelEvent: PropTypes.func,
    accessToken: PropTypes.string,
    handleWishlist: PropTypes.func,
}

export default EventInfo;