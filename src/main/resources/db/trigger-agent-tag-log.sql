DELIMITER $$

CREATE TRIGGER tr_tbl_tag_log_to_agent
AFTER INSERT ON tbl_tag_log
FOR EACH ROW
BEGIN
  INSERT INTO agent_tbl_tag_log (
    create_time,
    reader_name,
    ant_name,
    tag,
    ip_address,
    ant_seq,
    state
  ) VALUES (
    NEW.create_time,
    NEW.reader_name,
    NEW.ant_name,
    NEW.tag,
    NEW.ip_address,
    NEW.ant_seq,
    NEW.state
  );
END$$

DELIMITER ;
