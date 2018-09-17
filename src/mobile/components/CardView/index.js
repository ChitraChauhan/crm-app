import React, { Component } from "react";
import classNames from "classnames";
import "./styles.css";
import ManyToOne from "./../ManyToOne";
import ManyToMany from "./../ManyToMany"

export const ManyToOneField = ({
  className,
  edit,
  textClassName,
  value,
  titleClassName,
  fieldLabel,
  displayField,
  showTitle = true,
  ...props
}) => {
  return (
    <div
      className={classNames("card-field", className)}
      style={{ width: "100%" }}
    >
      {fieldLabel &&
        showTitle && (
          <span className={classNames("card-field-title", titleClassName)}>
            {fieldLabel}
          </span>
        )}
      {edit ? (
        <ManyToOne {...props} value={value} />
      ) : (
        <span className={classNames("card-field-text", textClassName)}>
          {value ? value[displayField] : null}
        </span>
      )}
    </div>
  );
};

export const ManyToManyField = ({ className, edit, fieldLabel, displayField, showTitle = true, titleClassName, value, ...props }) => (
  <div className={classNames('card-field', className)}>
    {
      fieldLabel && showTitle &&
      <span className={classNames("card-field-title", titleClassName, value, ...props)}>{fieldLabel}</span>
    }
    {
      edit ?
        <ManyToMany
          {...props}
          value={value}
        />
        :
        <div style={{ paddingTop: 7 }}>
          {
            value &&
            value.map((obj, i) => (
              <span key={i} className="many-to-many-button">{obj ? obj[displayField] : null}</span>
            ))
          }
        </div>
    }
  </div>
);

class CardView extends Component {
  render() {
    const {
      children,
      className,
      title,
      headerClassName,
      principalView,
      hidden
    } = this.props;
    return (
      !hidden && (
        <div
          className={classNames(
            principalView ? "principal-card-view" : "card-view",
            className
          )}
        >
          {title && (
            <div className={classNames("card-header", headerClassName)}>
              {title}
            </div>
          )}
          {children}
        </div>
      )
    );
  }
}

CardView.ManyToOne = ManyToOneField;
CardView.ManyToMany = ManyToManyField;

export default CardView;
