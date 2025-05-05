const MembersList = ({ members, onSelect }) => {
    return (
        <div className="members-list">
            {members.map(member => (
                <div
                    key={member.id}
                    className="member-item"
                    onClick={() => onSelect(member)}
                >
                    <img
                        src={member.avatar_url}
                        alt={member.login}
                        className="member-avatar"
                    />
                </div>
            ))}
        </div>
    );
};

export default MembersList;